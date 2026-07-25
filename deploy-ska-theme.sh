#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$ROOT_DIR/pterodactyl/arix/v2.1.0"
ARCHIVE_PATH="$ROOT_DIR/ska-theme-package.zip"

if [ ! -d "$TARGET_DIR" ]; then
  echo "[SKA] Theme directory missing: $TARGET_DIR" >&2
  exit 1
fi

rm -f "$ARCHIVE_PATH"
(
  cd "$ROOT_DIR"
  zip -r "$ARCHIVE_PATH" pterodactyl/arix/v2.1.0 README.md install-ska-theme.sh >/dev/null
)

echo "[SKA] Package created: $ARCHIVE_PATH"
echo "[SKA] You can now upload or push this release to GitHub."
