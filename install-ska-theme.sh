#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
THEME_DIR="$ROOT_DIR/pterodactyl/arix/v2.1.0"

if [ ! -d "$THEME_DIR" ]; then
  echo "[SKA] Theme directory not found: $THEME_DIR" >&2
  exit 1
fi

echo "[SKA] Installing blueprint extension bundle..."
cp -R "$THEME_DIR"/. "$ROOT_DIR/pterodactyl/arix/v2.1.0"

echo "[SKA] Installation complete."
echo "[SKA] Next steps:"
echo "  1. Clear panel caches if needed"
echo "  2. Open the admin editor and visit Blueprints"
echo "  3. Enable or disable the blueprints you want"
