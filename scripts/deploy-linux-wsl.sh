#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use 22

SRC="/mnt/c/Users/Ingar/OneDrive - ETI Norge AS/Projects/peisbutikken-frontend"
DST="$HOME/pb-frontend"
WIN_WRANGLER_CFG="/mnt/c/Users/Ingar/AppData/Roaming/xdg.config/.wrangler/config/default.toml"

# ---------------------------------------------------------------------------
# Release discipline (Windows/git side — BEFORE tar drops .git)
# - Clean tree required unless ALLOW_DIRTY_DEPLOY=1
# - Version from package.json (bump in release commit first, or use RELEASE_BUMP)
# - RELEASE_NOTES required (env or interactive TTY prompt)
# - Registry / CHANGELOG / annotated tag finalized AFTER deploy + smoke
# ---------------------------------------------------------------------------
cd "$SRC"

require_clean_or_allow_dirty() {
  if [[ -z "$(git status --porcelain 2>/dev/null)" ]]; then
    return 0
  fi
  if [[ "${ALLOW_DIRTY_DEPLOY:-}" == "1" ]]; then
    echo "WARN: dirty working tree — ALLOW_DIRTY_DEPLOY=1 set; continuing"
    git status --short || true
    return 0
  fi
  echo "ERROR: dirty working tree — commit or stash before production deploy" >&2
  git status --short >&2 || true
  echo "HINT: ALLOW_DIRTY_DEPLOY=1 to override (not recommended)" >&2
  exit 1
}

if [[ -n "${RELEASE_BUMP:-}" ]]; then
  case "${RELEASE_BUMP}" in
    patch|minor|major) ;;
    *)
      echo "ERROR: RELEASE_BUMP must be patch|minor|major (got: ${RELEASE_BUMP})" >&2
      exit 1
      ;;
  esac
  # Bump must start from a clean tree so the follow-up release commit is intentional.
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    echo "ERROR: working tree must be clean before RELEASE_BUMP" >&2
    git status --short >&2 || true
    exit 1
  fi
  echo "==> RELEASE_BUMP=${RELEASE_BUMP}: npm version --no-git-tag-version"
  npm version "${RELEASE_BUMP}" --no-git-tag-version
  NEW_VER="$(node -p "require('./package.json').version")"
  node scripts/release-record.mjs bump-changelog "${NEW_VER}"
  echo ""
  echo "ERROR: Version bumped to ${NEW_VER}. Commit these files, then re-run deploy" >&2
  echo "(without RELEASE_BUMP) so the shipped git SHA matches the release commit." >&2
  echo "  git add package.json package-lock.json CHANGELOG.md && git commit -m \"chore: release v${NEW_VER}\"" >&2
  echo "  RELEASE_NOTES='…' bash scripts/deploy-linux-wsl.sh" >&2
  exit 1
fi

require_clean_or_allow_dirty

RELEASE_VERSION="$(node -p "require('./package.json').version")"
if [[ -z "${RELEASE_VERSION}" || "${RELEASE_VERSION}" == "null" ]]; then
  echo "ERROR: could not read version from package.json" >&2
  exit 1
fi

if [[ -z "${RELEASE_NOTES:-}" ]]; then
  if [[ -t 0 ]]; then
    echo ""
    echo "Release notes required for v${RELEASE_VERSION}."
    echo "Enter a short summary (one line, or use ';' / newlines in RELEASE_NOTES env)."
    read -r -p "RELEASE_NOTES> " RELEASE_NOTES
  else
    echo "ERROR: RELEASE_NOTES is required for non-interactive deploy" >&2
    echo "HINT: RELEASE_NOTES='Fix X; Add Y' bash scripts/deploy-linux-wsl.sh" >&2
    exit 1
  fi
fi
RELEASE_NOTES="$(printf '%s' "${RELEASE_NOTES}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
if [[ -z "${RELEASE_NOTES}" ]]; then
  echo "ERROR: RELEASE_NOTES must be non-empty" >&2
  exit 1
fi

RELEASE_GIT_SHA="$(git rev-parse HEAD)"
RELEASE_GIT_SHA_SHORT="$(git rev-parse --short HEAD)"
RELEASE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
# releasedAt is finalized after successful deploy + smoke (UTC ISO).

echo "==> Release: v${RELEASE_VERSION} sha=${RELEASE_GIT_SHA_SHORT} (${RELEASE_GIT_SHA}) branch=${RELEASE_BRANCH}"
echo "==> Notes: ${RELEASE_NOTES}"

echo "==> Prepare $DST"
rm -rf "$DST"
mkdir -p "$DST"

echo "==> Copy source (exclude heavy/build dirs + local env that bakes test keys)"
# Still in $SRC (git side). Never ship .env.local / .dev.vars into the Linux build —
# Next inlines NEXT_PUBLIC_* at build time (e.g. Turnstile always-pass dummy keys).
tar --exclude='.git' --exclude='.next' --exclude='.open-next' --exclude='node_modules' \
  --exclude='tmp' --exclude='.cursor' --exclude='.dev.vars' --exclude='.env.local' \
  --exclude='.env*.local' \
  -cf - . | tar -C "$DST" -xf -

mkdir -p "$HOME/.config/.wrangler/config" "$HOME/.wrangler/config"
# WSL may bind-mount Windows AppData over ~/.config — copy via cat to avoid "same file"
if [[ -f "$WIN_WRANGLER_CFG" ]]; then
  cat "$WIN_WRANGLER_CFG" >"$HOME/.wrangler/config/default.toml"
  # Only write XDG path if it is a different inode/path
  if [[ "$(readlink -f "$WIN_WRANGLER_CFG" 2>/dev/null || echo "$WIN_WRANGLER_CFG")" != "$(readlink -f "$HOME/.config/.wrangler/config/default.toml" 2>/dev/null || echo "")" ]]; then
    cat "$WIN_WRANGLER_CFG" >"$HOME/.config/.wrangler/config/default.toml" || true
  fi
  export WRANGLER_HOME="${WRANGLER_HOME:-$HOME/.wrangler}"
  echo "==> Wrangler credentials ready ($WRANGLER_HOME)"
else
  echo "ERROR: missing Windows wrangler config: $WIN_WRANGLER_CFG" >&2
  exit 1
fi

cd "$DST"

# Pull selected keys from Windows env files without copying them into the build
# tree (full .env.local would bake local Turnstile always-pass dummies).
export_dotenv_keys() {
  local file="$1"
  shift
  [[ -f "$file" ]] || return 0
  local key line val
  for key in "$@"; do
    line=$(grep -E "^${key}=" "$file" 2>/dev/null | tail -n 1 || true)
    [[ -n "$line" ]] || continue
    val="${line#*=}"
    val="${val%$'\r'}"
    if [[ "$val" == \"*\" && "$val" == *\" ]]; then
      val="${val:1:${#val}-2}"
    elif [[ "$val" == \'*\' && "$val" == *\' ]]; then
      val="${val:1:${#val}-2}"
    fi
    export "${key}=${val}"
  done
}

export_dotenv_keys "$SRC/.env.local" \
  NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL \
  NEXT_PUBLIC_CHATWAY_ID \
  NEXT_PUBLIC_CHATWAY_DELAY_MS

# OpenNext --rclone needs an R2 API token scoped to peisbutikken-next-inc-cache-weur.
# Do NOT map CONTACT_R2_* here — that token is bucket-scoped and returns 403 on the cache bucket.
export_dotenv_keys "$SRC/.dev.vars" \
  R2_ACCESS_KEY_ID \
  R2_SECRET_ACCESS_KEY \
  CF_ACCOUNT_ID \
  CLOUDFLARE_ACCOUNT_ID

export CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-${CLOUDFLARE_ACCOUNT_ID:-}}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-${CF_ACCOUNT_ID:-}}"

export NEXT_PUBLIC_SITE_URL="https://peisbutikken.no"
# Production Turnstile sitekey for peisbutikken.no (public; must match Worker secret).
# Local .env.local uses Cloudflare always-pass dummies — must not be used here.
export NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAAPSjVBsSPee1nan"
#
# GTM — baked into the Next build (NEXT_PUBLIC_*). DO NOT unset these for "prod".
# A prior main commit cleared them and shipped without first-party GTM.
# Web container ID only (NOT the server/sGTM container). First-party via /cartdata.
export NEXT_PUBLIC_GTM_ID="GTM-M6BX6KG2"
export NEXT_PUBLIC_GTM_SCRIPT_URL="https://peisbutikken.no/cartdata/gtm.js"
export NEXT_PUBLIC_GTM_SCRIPT_QUERY="id=GTM-M6BX6KG2"
export NEXT_PUBLIC_GTM_NOSCRIPT_URL="https://peisbutikken.no/cartdata/ns.html"
# Ensure no leftover local Turnstile secret is present for the build machine.
unset TURNSTILE_SECRET_KEY || true

if [[ -z "${NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL:-}" ]]; then
  echo "ERROR: NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL missing (expected in Windows .env.local)" >&2
  exit 1
fi

# Fail closed: empty/unset GTM means a broken analytics build — stop before OpenNext.
for gtm_var in \
  NEXT_PUBLIC_GTM_ID \
  NEXT_PUBLIC_GTM_SCRIPT_URL \
  NEXT_PUBLIC_GTM_SCRIPT_QUERY \
  NEXT_PUBLIC_GTM_NOSCRIPT_URL
do
  if [[ -z "${!gtm_var:-}" ]]; then
    echo "ERROR: ${gtm_var} is empty — refusing to deploy without GTM bake-in" >&2
    echo "HINT: do not unset NEXT_PUBLIC_GTM_* in this script; see comments above." >&2
    exit 1
  fi
done
if [[ "${NEXT_PUBLIC_GTM_ID}" != GTM-* ]]; then
  echo "ERROR: NEXT_PUBLIC_GTM_ID must look like GTM-… (got: ${NEXT_PUBLIC_GTM_ID})" >&2
  exit 1
fi

echo "==> Build env: SITE_URL=$NEXT_PUBLIC_SITE_URL GRAPHQL_URL set TURNSTILE=prod GTM=${NEXT_PUBLIC_GTM_ID} loader=${NEXT_PUBLIC_GTM_SCRIPT_URL}"

echo "==> npm install"
npm install

echo "==> OpenNext Cloudflare build (loud log + warn/error summary)"
node scripts/run-opennext-loud.mjs build

# Prefer OpenNext deploy (populates R2) over bare wrangler:
# - lower concurrency reduces intermittent 502s during bulk put
# - --rclone skips unchanged objects when rclone.js is installed + R2 API creds exist
echo "==> OpenNext deploy (keep_vars, resilient R2 populate; loud log + warn/error summary)"
# Allow wrangler.jsonc build gate (blocks bare wrangler publish without OpenNext).
export PB_OPENNEXT_DEPLOY=1
RCLONE_FLAG=()
if node -e "require.resolve('rclone.js')" >/dev/null 2>&1 \
  && [[ -n "${R2_ACCESS_KEY_ID:-}" && -n "${R2_SECRET_ACCESS_KEY:-}" && -n "${CF_ACCOUNT_ID:-}" ]]; then
  RCLONE_FLAG=(--rclone)
  echo "==> Using rclone for R2 populate (skips unchanged cache objects)"
else
  echo "==> rclone skipped (missing rclone.js or R2 API creds) — HTTP populate cacheChunkSize=8"
fi
node scripts/run-opennext-loud.mjs deploy --cacheChunkSize=8 "${RCLONE_FLAG[@]}" -- \
  --keep-vars --var NEXT_PUBLIC_SITE_URL:https://peisbutikken.no

echo "==> Smoke workers.dev"
DEV_HOST="https://peisbutikken-frontend.ingar.workers.dev"
for path in "/" "/shop/" "/kontakt-oss/"; do
  code=""
  for attempt in 1 2 3; do
    code=$(curl -sS -o /tmp/pb-smoke.html -w "%{http_code}" -A "Mozilla/5.0" "${DEV_HOST}${path}")
    bytes=$(wc -c </tmp/pb-smoke.html)
    has_next=0
    grep -q '__NEXT_DATA__\|Peisbutikken' /tmp/pb-smoke.html && has_next=1 || true
    echo "SMOKE ${path} attempt=${attempt} HTTP=${code} bytes=${bytes} nextish=${has_next}"
    [[ "$code" == "200" ]] && break
    sleep 5
  done
  if [[ "$code" != "200" ]]; then
    echo "SMOKE FAILED — apex catch-all not flipped" >&2
    head -c 400 /tmp/pb-smoke.html >&2 || true
    exit 2
  fi
done

# Apex PDP smoke (Norway user-facing). Fail closed so a broken cutover is not
# reported as SUCCESS. Uses curated bestsellers; see scripts/verify-pdp-smoke.mjs.
echo "==> Smoke apex PDPs (peisbutikken.no)"
SMOKE_BASE_URL="${SMOKE_BASE_URL:-https://peisbutikken.no}" \
  node scripts/verify-pdp-smoke.mjs || {
  echo "ERROR: Apex PDP smoke failed — Worker is live but product pages failed verification" >&2
  exit 2
}

# Finalize release record + annotated tag on the Windows/git tree (not $DST).
# Only after OpenNext deploy + smoke so failed deploys never leave lying tags.
echo "==> Finalize release record (v${RELEASE_VERSION})"
RELEASED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
(
  cd "$SRC"
  node scripts/release-record.mjs finalize \
    --version "${RELEASE_VERSION}" \
    --git-sha "${RELEASE_GIT_SHA}" \
    --git-sha-short "${RELEASE_GIT_SHA_SHORT}" \
    --branch "${RELEASE_BRANCH}" \
    --released-at "${RELEASED_AT}" \
    --notes "${RELEASE_NOTES}"

  TAG="v${RELEASE_VERSION}"
  if git rev-parse "${TAG}" >/dev/null 2>&1; then
    EXISTING_SHA="$(git rev-parse "${TAG}^{}")"
    if [[ "${EXISTING_SHA}" != "${RELEASE_GIT_SHA}" ]]; then
      echo "ERROR: tag ${TAG} already exists at ${EXISTING_SHA}, not ${RELEASE_GIT_SHA}" >&2
      echo "HINT: bump package.json version for a new ship, or delete the mistaken local tag" >&2
      exit 1
    fi
    echo "==> Tag ${TAG} already points at ${RELEASE_GIT_SHA_SHORT} — leaving as-is"
  else
    git tag -a "${TAG}" -m "Release ${TAG}: ${RELEASE_NOTES}"
    echo "==> Created annotated tag ${TAG} at ${RELEASE_GIT_SHA_SHORT}"
  fi
  echo ""
  echo "RELEASE RECORDED: v${RELEASE_VERSION} @ ${RELEASE_GIT_SHA_SHORT} (${RELEASED_AT})"
  echo "  docs/releases/REGISTRY.md"
  echo "  docs/releases/last-deploy.json"
  echo "  CHANGELOG.md (if section was missing)"
  echo "  tmp/opennext-logs/last-deploy*.json (gitignored copy)"
  echo "Commit release record files when ready, then push the tag if desired:"
  echo "  git add CHANGELOG.md docs/releases/ && git commit -m \"chore: record deploy v${RELEASE_VERSION}\""
  echo "  git push origin HEAD && git push origin ${TAG}"
  echo ""
)

# OpenNext keys ISR cache as incremental-cache/<BUILD_ID>/… — old prefixes are never
# reused and will grow the bucket forever unless pruned (saw ~40GB on the old bucket).
# Require R2 API creds so prune cannot be silently skipped after a successful deploy.
if [[ -z "${R2_ACCESS_KEY_ID:-}" || -z "${R2_SECRET_ACCESS_KEY:-}" || -z "${CF_ACCOUNT_ID:-}" ]]; then
  echo "ERROR: R2 API creds missing — cannot prune stale incremental-cache prefixes" >&2
  echo "HINT: set R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / CF_ACCOUNT_ID in Windows .dev.vars" >&2
  echo "HINT: Worker is already live; fix creds and run: npm run cache:prune-r2:execute" >&2
  exit 3
fi

echo "==> Prune stale R2 incremental-cache prefixes (keep current BUILD_ID)"
# KEEP_BUILD_IDS=1 current only; set 2 if you want one rollback generation.
KEEP_BUILD_IDS="${KEEP_BUILD_IDS:-1}" node scripts/cleanup-r2-inc-cache.mjs --execute || {
  echo "ERROR: R2 cache prune failed (Worker is live — re-run npm run cache:prune-r2:execute)" >&2
  exit 3
}

echo "==> SUCCESS: Worker healthy on workers.dev + apex PDPs (catch-all unchanged)"