#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_DIR="$ROOT_DIR/clawhub/readable-output-skill"
SKILL_FILE="$SKILL_DIR/SKILL.md"
SLUG="readable-output"
DISPLAY_NAME="看得清 Readable Output · Readability Layout / 多语言排版"
TAGS="${CLAWD_TAGS:-latest}"

if [[ ! -f "$SKILL_FILE" ]]; then
  echo "[readable-output-skill] missing skill file: $SKILL_FILE" >&2
  exit 1
fi

if ! command -v clawhub >/dev/null 2>&1; then
  echo "[readable-output-skill] clawhub CLI is not installed; skipping publish" >&2
  exit 0
fi

if ! clawhub whoami >/dev/null 2>&1; then
  echo "[readable-output-skill] clawhub CLI is not logged in; skipping publish" >&2
  exit 0
fi

node "$ROOT_DIR/scripts/check-clawhub-listing-safety.mjs"

file_version="$(
  node - <<'NODE' "$SKILL_FILE"
const fs = require("fs");
const text = fs.readFileSync(process.argv[2], "utf8");
const match = text.match(/^version:\s*([0-9]+\.[0-9]+\.[0-9]+)\s*$/m);
if (!match) throw new Error("Missing skill version");
console.log(match[1]);
NODE
)"

remote_json="$(clawhub inspect "$SLUG" --json 2>/dev/null || true)"
remote_version="$(
  node - <<'NODE' "$remote_json"
const input = process.argv[2] || "";
try {
  const parsed = JSON.parse(input);
  const version = parsed?.latestVersion?.version || "";
  if (version) process.stdout.write(version);
} catch {}
NODE
)"

version="${1:-}"
if [[ -z "$version" ]]; then
  version="$(
    node - <<'NODE' "$file_version" "$remote_version"
function parse(version) {
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)$/);
  return match ? match.slice(1).map(Number) : null;
}
function compare(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}
const fileVersion = parse(process.argv[2]);
const remoteVersion = parse(process.argv[3]);
if (!fileVersion) throw new Error("Invalid file version");
if (!remoteVersion || compare(fileVersion, remoteVersion) > 0) {
  process.stdout.write(fileVersion.join("."));
  process.exit(0);
}
remoteVersion[2] += 1;
process.stdout.write(remoteVersion.join("."));
NODE
  )"
fi

changelog="${2:-}"

publish_args=(
  publish
  "$SKILL_DIR"
  --slug "$SLUG"
  --name "$DISPLAY_NAME"
  --version "$version"
  --tags "$TAGS"
)

if [[ -n "$changelog" ]]; then
  publish_args+=(--changelog "$changelog")
fi

echo "[readable-output-skill] publishing $SLUG from $SKILL_DIR as $version"
exec clawhub "${publish_args[@]}"
