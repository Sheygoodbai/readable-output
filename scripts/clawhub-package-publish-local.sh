#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_DIR="$ROOT_DIR"
SOURCE_PATH="."
TAGS="${CLAWD_TAGS:-latest}"

if [[ ! -f "$PLUGIN_DIR/openclaw.plugin.json" ]]; then
  echo "[readable-output-package] missing plugin manifest" >&2
  exit 1
fi

if ! command -v clawhub >/dev/null 2>&1; then
  echo "[readable-output-package] clawhub CLI is not installed; skipping publish" >&2
  exit 0
fi

if ! clawhub whoami >/dev/null 2>&1; then
  echo "[readable-output-package] clawhub CLI is not logged in; skipping publish" >&2
  exit 0
fi

node "$ROOT_DIR/scripts/check-clawhub-listing-safety.mjs" --mode-package

remote_url="$(git -C "$ROOT_DIR" remote get-url origin 2>/dev/null || true)"
if [[ -z "$remote_url" ]]; then
  echo "[readable-output-package] missing origin remote; skipping publish" >&2
  exit 0
fi

source_repo="$(
  node - <<'NODE' "$remote_url"
const remoteUrl = process.argv[2] || "";
const trimmed = remoteUrl
  .trim()
  .replace(/^git\+/, "")
  .replace(/\.git$/i, "")
  .replace(/^git@github\.com:/i, "https://github.com/");
if (!trimmed) process.exit(1);
try {
  const parsed = new URL(trimmed);
  const parts = parsed.pathname.split("/").filter(Boolean);
  console.log(`${parts[0]}/${parts[1].replace(/\.git$/i, "")}`);
} catch {
  const shorthand = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!shorthand) process.exit(1);
  console.log(`${shorthand[1]}/${shorthand[2]}`);
}
NODE
)"

source_commit="$(git -C "$ROOT_DIR" rev-parse HEAD)"
source_ref="$(
  git -C "$ROOT_DIR" describe --tags --exact-match 2>/dev/null ||
  git -C "$ROOT_DIR" branch --show-current 2>/dev/null ||
  printf '%s' "$source_commit"
)"

major_minor="$(
  node - <<'NODE' "$PLUGIN_DIR/package.json"
const pkg = require(process.argv[2]);
const match = String(pkg.version || "").match(/^(\d+)\.(\d+)\.(\d+)/);
if (!match) throw new Error("Unsupported semver version");
console.log(`${match[1]}.${match[2]}`);
NODE
)"

utc_stamp="$(date -u +%Y%m%d%H%M%S)"
version="${1:-${major_minor}.9${utc_stamp}}"

echo "[readable-output-package] publishing $source_repo@$source_ref:$SOURCE_PATH as $version"

exec npx -y clawhub@0.9.0 package publish "$PLUGIN_DIR" \
  --source-repo "$source_repo" \
  --source-commit "$source_commit" \
  --source-ref "$source_ref" \
  --source-path "$SOURCE_PATH" \
  --version "$version" \
  --tags "$TAGS"

