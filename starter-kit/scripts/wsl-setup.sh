#!/usr/bin/env bash
# Run as the normal WSL user:  wsl -e bash "/mnt/c/.../scripts/wsl-setup.sh"
#
# Installs nvm + Node inside WSL so builds use Linux-native binaries
# (never the Windows node leaking through /mnt/c on the PATH).
set -euo pipefail

NODE_MAJOR=24

if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

nvm install "$NODE_MAJOR"
nvm alias default "$NODE_MAJOR"

echo "node: $(node --version) at $(which node)"
echo "npm:  $(npm --version)"
