#!/usr/bin/env bash
# Build + deploy from inside WSL. Run from Windows with:
#   npm run deploy:wsl
#
# Works for projects living on NTFS/OneDrive: building there from WSL is
# slow (drvfs) and OneDrive locks/syncs build output (.open-next), so the
# source is mirrored to an ext4 build dir first and everything runs there.
# OneDrive never sees node_modules or build artifacts; the Windows-side
# node_modules is never touched (platform binaries would conflict).
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

SRC="$(cd "$(dirname "$0")/.." && pwd)"
# Per-project build dir derived from the project folder name.
PROJECT_NAME="$(basename "$SRC" | tr -c '[:alnum:]._-' '-' | sed 's/-*$//')"
BUILD_DIR="$HOME/wsl-builds/$PROJECT_NAME/src"

mkdir -p "$BUILD_DIR"

echo "==> Mirroring source to $BUILD_DIR"
rsync -a --delete \
  --exclude .git \
  --exclude node_modules \
  --exclude .next \
  --exclude .open-next \
  --exclude .wrangler \
  --exclude .velite \
  --exclude data \
  --exclude inspiration \
  --exclude starter-kit \
  "$SRC/" "$BUILD_DIR/"

cd "$BUILD_DIR"

echo "==> npm install"
npm install --no-audit --no-fund

echo "==> Build + deploy"
npm run deploy
