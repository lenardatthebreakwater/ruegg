#!/usr/bin/env bash
# OpenNext build + wrangler --dry-run inside WSL/Linux. NEVER deploys.
#
# Invoked by: npm run release:build:verify
# Temp tree:  $HOME/pb-frontend-verify  (known path; safe to replace)
#
# Fail-closed: refuses to run wrangler deploy without --dry-run.
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
  nvm use 22 >/dev/null
fi

SRC="/mnt/c/Users/Ingar/OneDrive - ETI Norge AS/Projects/peisbutikken-frontend"
# Fallback: if already running from a Linux checkout of this repo
if [[ ! -d "$SRC" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  SRC="$(cd "$SCRIPT_DIR/.." && pwd)"
fi

DST="${PB_VERIFY_DST:-$HOME/pb-frontend-verify}"
WIN_WRANGLER_CFG="/mnt/c/Users/Ingar/AppData/Roaming/xdg.config/.wrangler/config/default.toml"

echo "==> [WSL] BUILD-VERIFY ONLY — no OpenNext deploy, no R2 populate, no cache prune"
echo "==> [WSL] Source: $SRC"
echo "==> [WSL] Temp:   $DST (known path; will replace contents)"

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: source project not found: $SRC" >&2
  exit 1
fi

# Safety: never point DST at the OneDrive source tree
if [[ "$(readlink -f "$DST" 2>/dev/null || echo "$DST")" == "$(readlink -f "$SRC" 2>/dev/null || echo "$SRC")" ]]; then
  echo "ERROR: PB_VERIFY_DST must not equal source tree" >&2
  exit 1
fi

echo "==> [WSL] Prepare temp tree"
rm -rf "$DST"
mkdir -p "$DST"

echo "==> [WSL] Copy source (exclude heavy/build dirs + local env)"
cd "$SRC"
tar --exclude='.git' --exclude='.next' --exclude='.open-next' --exclude='node_modules' \
  --exclude='tmp' --exclude='.cursor' --exclude='.dev.vars' --exclude='.env.local' \
  --exclude='.env*.local' \
  -cf - . | tar -C "$DST" -xf -

# Wrangler auth for dry-run size/bindings (read config only; no secret printing)
mkdir -p "$HOME/.config/.wrangler/config" "$HOME/.wrangler/config"
if [[ -f "$WIN_WRANGLER_CFG" ]]; then
  cat "$WIN_WRANGLER_CFG" >"$HOME/.wrangler/config/default.toml"
  if [[ "$(readlink -f "$WIN_WRANGLER_CFG" 2>/dev/null || echo "$WIN_WRANGLER_CFG")" != "$(readlink -f "$HOME/.config/.wrangler/config/default.toml" 2>/dev/null || echo "")" ]]; then
    cat "$WIN_WRANGLER_CFG" >"$HOME/.config/.wrangler/config/default.toml" || true
  fi
  export WRANGLER_HOME="${WRANGLER_HOME:-$HOME/.wrangler}"
  echo "==> [WSL] Wrangler credentials ready ($WRANGLER_HOME)"
else
  echo "==> [WSL] WARN: Windows wrangler config not found — dry-run may need prior wrangler login"
fi

cd "$DST"

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

# Public / build-needed only — never echo values
export_dotenv_keys "$SRC/.env.local" \
  NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL \
  NEXT_PUBLIC_CHATWAY_ID \
  NEXT_PUBLIC_CHATWAY_DELAY_MS

export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://peisbutikken.no}"
# Production Turnstile sitekey (public). Local always-pass dummies must not be copied via .env.local.
export NEXT_PUBLIC_TURNSTILE_SITE_KEY="${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-0x4AAAAAAAPSjVBsSPee1nan}"
export NEXT_PUBLIC_GTM_ID="${NEXT_PUBLIC_GTM_ID:-GTM-M6BX6KG2}"
export NEXT_PUBLIC_GTM_SCRIPT_URL="${NEXT_PUBLIC_GTM_SCRIPT_URL:-https://peisbutikken.no/cartdata/gtm.js}"
export NEXT_PUBLIC_GTM_SCRIPT_QUERY="${NEXT_PUBLIC_GTM_SCRIPT_QUERY:-id=GTM-M6BX6KG2}"
export NEXT_PUBLIC_GTM_NOSCRIPT_URL="${NEXT_PUBLIC_GTM_NOSCRIPT_URL:-https://peisbutikken.no/cartdata/ns.html}"
unset TURNSTILE_SECRET_KEY || true

if [[ -z "${NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL:-}" ]]; then
  echo "ERROR: NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL missing (expected in Windows .env.local)" >&2
  exit 1
fi

echo "==> [WSL] Build env: SITE_URL set, GRAPHQL_URL set, TURNSTILE=prod key, GTM id set (values not printed)"

echo "==> [WSL] npm ci (prefer lockfile) or npm install"
if ! npm ci --no-audit --no-fund; then
  echo "==> [WSL] npm ci failed — falling back to npm install"
  npm install --no-audit --no-fund
fi

echo "==> [WSL] OpenNext Cloudflare build (loud log)"
node scripts/run-opennext-loud.mjs build

# Fail-closed: only dry-run is allowed here. Never call wrangler deploy without --dry-run.
WRANGLER_CMD=(npx wrangler deploy --dry-run)
if [[ "${WRANGLER_CMD[*]}" != *"--dry-run"* ]]; then
  echo "ERROR: refusing wrangler deploy without --dry-run" >&2
  exit 1
fi
# Extra guard against accidental edits that drop --dry-run
case " ${WRANGLER_CMD[*]} " in
  *" --dry-run "*) ;;
  *)
    echo "ERROR: --dry-run missing from wrangler invocation" >&2
    exit 1
    ;;
esac

# Satisfy wrangler.jsonc build gate (blocks bare publish; dry-run is allowed).
export PB_WRANGLER_DRY_RUN=1
echo "==> [WSL] Wrangler dry-run (NO publish): ${WRANGLER_CMD[*]}"
"${WRANGLER_CMD[@]}"

echo ""
echo "==> [WSL] SUCCESS: build-verify complete (artifact in $DST)"
echo "==> [WSL] Review dry-run output for Worker gzip size and bindings."
echo "==> [WSL] Expected local DO/workerd warnings during build are usually OK."
echo "==> [WSL] Production deploy still requires: bash scripts/deploy-linux-wsl.sh (explicit auth)"
