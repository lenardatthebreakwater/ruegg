"use client";

type SearchableProduct = {
  name: string;
  brand?: string | null;
  fireplaceType?: string | null;
  color?: string | null;
  sku?: string | null;
  categories?: Array<{ name: string; slug: string }> | null;
};

export type RankedProduct<TProduct extends SearchableProduct = SearchableProduct> = {
  product: TProduct;
  score: number;
};

const TOKEN_SPLIT_REGEX = /\s+/g;
const NON_WORD_REGEX = /[^a-z0-9æøå\s-]/g;
const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;
const MIN_TYPO_TOKEN_LENGTH = 4;
/** ASCII placeholder so NON_WORD_REGEX does not strip protected decimals. */
const DECIMAL_PLACEHOLDER = "xxdotxx";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "")
    // Keep model decimals as one token (aduro 9.5 → "aduro", "9.5" — not "9" + "5").
    .replace(/(\d)[,.](\d)/g, `$1${DECIMAL_PLACEHOLDER}$2`)
    .replace(NON_WORD_REGEX, " ")
    .replaceAll(DECIMAL_PLACEHOLDER, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  const normalized = normalize(value);
  return normalized ? normalized.split(TOKEN_SPLIT_REGEX).filter(Boolean) : [];
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const next = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j += 1) {
    prev[j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    next[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      next[j] = Math.min(
        prev[j] + 1,
        next[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j += 1) {
      prev[j] = next[j];
    }
  }

  return prev[b.length];
}

function typoSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

function getProductSearchFields(product: SearchableProduct): string[] {
  const categoryNames = (product.categories ?? []).map((category) => category.name);

  return [
    product.name,
    product.brand ?? "",
    product.fireplaceType ?? "",
    product.color ?? "",
    product.sku ?? "",
    ...categoryNames,
  ].filter(Boolean);
}

function toTitleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isNumericModelToken(token: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(token);
}

/** True when a numeric/model token is a whole segment (not a loose substring). */
function wordHasNumericModelToken(word: string, token: string): boolean {
  if (word === token) return true;
  const segments = word.split(/[^0-9.]+/).filter(Boolean);
  return segments.some(
    (segment) => segment === token || segment.startsWith(`${token}.`)
  );
}

function scoreToken(token: string, words: string[]): number {
  let tokenScore = 0;
  const numericToken = isNumericModelToken(token);

  for (const word of words) {
    if (word === token) {
      tokenScore = Math.max(tokenScore, 2.5);
      continue;
    }

    // Bare digits / decimals must not substring-match unrelated SKUs ("5" in "15.9").
    if (numericToken) {
      if (wordHasNumericModelToken(word, token)) {
        tokenScore = Math.max(tokenScore, 2.5);
      }
      continue;
    }

    if (word.startsWith(token)) {
      tokenScore = Math.max(tokenScore, 2);
      continue;
    }
    if (word.includes(token)) {
      tokenScore = Math.max(tokenScore, 1.4);
      continue;
    }

    if (token.length >= MIN_TYPO_TOKEN_LENGTH && word.length >= MIN_TYPO_TOKEN_LENGTH) {
      const similarity = typoSimilarity(token, word);
      if (similarity >= 0.72) {
        tokenScore = Math.max(tokenScore, 0.9 + similarity);
      }
    }
  }

  return tokenScore;
}

export function getSearchScore<TProduct extends SearchableProduct>(
  product: TProduct,
  query: string
): number {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const fields = getProductSearchFields(product);
  const normalizedFields = fields.map((field) => normalize(field)).filter(Boolean);
  const queryTokens = tokenize(normalizedQuery);
  const words = normalizedFields.flatMap((field) => tokenize(field));

  let score = 0;

  const nameNormalized = normalize(product.name);
  if (nameNormalized.includes(normalizedQuery)) {
    score += 8;
  }

  const brandNormalized = normalize(product.brand ?? "");
  if (brandNormalized && brandNormalized.includes(normalizedQuery)) {
    score += 3.5;
  }

  // Multi-token queries require every token to match (aduro 9.5 ≠ every "9"/"5" SKU).
  for (const token of queryTokens) {
    const tokenScore = scoreToken(token, words);
    if (tokenScore <= 0) {
      return 0;
    }
    score += tokenScore;
  }

  if (normalizedQuery.length >= 5) {
    const nameSimilarity = typoSimilarity(normalizedQuery, nameNormalized);
    if (nameSimilarity >= 0.78) {
      score += 2 * nameSimilarity;
    }
  }

  return score;
}

export function isProductMatchingSearch<TProduct extends SearchableProduct>(
  product: TProduct,
  query: string
): boolean {
  return getSearchScore(product, query) > 1.25;
}

export function rankProductsByQuery<TProduct extends SearchableProduct>(
  products: TProduct[],
  query: string
): RankedProduct<TProduct>[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return products.map((product) => ({ product, score: 0 }));
  }

  return products
    .map((product) => ({
      product,
      score: getSearchScore(product, normalizedQuery),
    }))
    .filter((entry) => entry.score > 1.25)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
}

export function searchProducts<TProduct extends SearchableProduct>(
  products: TProduct[],
  query: string
): TProduct[] {
  return rankProductsByQuery(products, query).map((entry) => entry.product);
}

export function normalizeSearchQuery(query: string): string {
  return normalize(query);
}

export function suggestSearchQueries(
  products: SearchableProduct[],
  query: string,
  limit = 8
): string[] {
  const ranked = rankProductsByQuery(products, query);
  return suggestSearchQueriesFromRanked(ranked, query, limit);
}

export function suggestSearchQueriesFromRanked<TProduct extends SearchableProduct>(
  rankedProducts: RankedProduct<TProduct>[],
  query: string,
  limit = 8
): string[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const ranked = rankedProducts.slice(0, 40);
  const suggestions: string[] = [];
  const seen = new Set<string>();

  const pushSuggestion = (value: string) => {
    const candidate = value.trim();
    if (!candidate) return;
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate || seen.has(normalizedCandidate)) return;
    seen.add(normalizedCandidate);
    suggestions.push(toTitleCase(candidate));
  };

  for (const { product } of ranked) {
    pushSuggestion(product.name);
    if (product.brand) pushSuggestion(product.brand);
    for (const category of product.categories ?? []) {
      pushSuggestion(category.name);
    }
  }

  const queryTokens = tokenize(normalizedQuery);
  const queryTokenSet = new Set(queryTokens);
  const tokenSuggestions = ranked
    .flatMap(({ product }) => getProductSearchFields(product))
    .flatMap((field) => tokenize(field))
    .filter((token) => token.length >= 3)
    .filter((token) => token.startsWith(normalizedQuery) || queryTokenSet.has(token))
    .slice(0, 24);
  for (const token of tokenSuggestions) pushSuggestion(token);

  return suggestions.slice(0, limit);
}
