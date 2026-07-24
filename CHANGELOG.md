# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Production releases append dated `## [X.Y.Z] - YYYY-MM-DD` entries with bullets.
Bump `package.json` (and preferably draft bullets under `[Unreleased]`) in the release
commit before running `bash scripts/deploy-linux-wsl.sh`. Deploy finalizes the dated
section from `RELEASE_NOTES` when that version header is not already present, writes
`docs/releases/*`, and creates a local annotated git tag `vX.Y.Z` after successful
OpenNext deploy + smoke.

## [Unreleased]

