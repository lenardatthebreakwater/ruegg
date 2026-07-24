# WooCommerce Description Cards Guide

Use this guide when editing a product in WooCommerce and you want the single product page to render description cards instead of legacy HTML text.

## Source priority

The frontend reads card content in this order:

1. JetEngine metabox key `product_description_cards`
2. WooCommerce long description (`Description`) as fallback

If `product_description_cards` is empty, fallback behavior remains unchanged.

## Where to edit

1. Go to `Produkter` in WooCommerce admin.
2. Open a product.
3. Prefer editing the JetEngine metabox field with key `product_description_cards`.
4. If needed, you can still edit **Description** (long description) as fallback content.

## Required format

Use card markers exactly like this:

```text
[CARD:ytelse]
Skriv produktets ytelse her.

[CARD:forbruk]
Skriv informasjon om forbruk og effektivitet her.

[CARD:installasjon]
Skriv installasjonsinfo her.
```

### Optional custom title (supports long sentence titles)

If you want a specific long title, use:

```text
[CARD:prestasjon|Dette er en lengre tittel som vises på kortet]
Din tekst for innholdet.
```

Format:

`[CARD:key|Din lange tittel]`

## Card keys and titles

- You can use any card key in `[CARD:key]`.
- The frontend auto-generates title from the key:
  - `[CARD:prestasjon]` -> `Prestasjon`
  - `[CARD:forbruk_og_effektivitet]` -> `Forbruk Og Effektivitet`
- Existing predefined keys still have custom titles/icons:
  - `ytelse` -> `Ytelse`
  - `forbruk` -> `Forbruk og effektivitet`
  - `installasjon` -> `Installasjon`

## Important notes

- Keep marker syntax exact: `[CARD:key]`
- For custom titles, use exact syntax: `[CARD:key|Din lange tittel]`
- You can use paragraphs under each marker.
- If no card markers are found, frontend falls back to legacy product description rendering.
