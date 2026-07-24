# Deploy registry

Append-only human log of production ships for `peisbutikken-frontend`.

- Machine-readable last ship: [`last-deploy.json`](./last-deploy.json)
- Source of truth for version at ship time: root `package.json` + git tag `vX.Y.Z`
- Written by `scripts/deploy-linux-wsl.sh` **after** successful OpenNext deploy + smoke
- A copy of `last-deploy.json` is also written under `tmp/opennext-logs/` (gitignored)

## Entries

_No production ships recorded yet._

