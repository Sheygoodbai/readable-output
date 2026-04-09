#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/alma/readable-output"
EXT_DIR="$ROOT/browser-companion/openclaw-tool-overlay"
DIST_DIR="$ROOT/dist"
VERSION="$(python3 - <<'PY'
import json
from pathlib import Path
manifest = Path('/Users/alma/readable-output/browser-companion/openclaw-tool-overlay/manifest.json')
print(json.loads(manifest.read_text())['version'])
PY
)"
OUT_DIR="$DIST_DIR/openclaw-tool-overlay-$VERSION"
ZIP_PATH="$DIST_DIR/openclaw-tool-overlay-$VERSION.zip"

mkdir -p "$DIST_DIR"
rm -rf "$OUT_DIR" "$ZIP_PATH"
mkdir -p "$OUT_DIR"
cp -R "$EXT_DIR"/. "$OUT_DIR"/
rm -f "$OUT_DIR/fixture.html" "$OUT_DIR/fixture.css" "$OUT_DIR/fixture.js"
(cd "$DIST_DIR" && COPYFILE_DISABLE=1 zip -X -qr "openclaw-tool-overlay-$VERSION.zip" "openclaw-tool-overlay-$VERSION")
echo "$ZIP_PATH"
