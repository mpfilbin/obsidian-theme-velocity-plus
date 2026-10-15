#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# Read the name from manifest.json; Obsidian requires the theme folder to match it exactly.
THEME_NAME="$(node -e 'const fs = require("node:fs"); const path = require("node:path"); const manifest = JSON.parse(fs.readFileSync(path.join(process.argv[1], "manifest.json"), "utf8")); if (typeof manifest.name !== "string" || manifest.name.length === 0) { throw new Error("manifest.json is missing a valid theme name"); } process.stdout.write(manifest.name);' "$REPO_ROOT")"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <path-to-obsidian-vault>"
  echo ""
  echo "Example: $0 ~/Documents/MyVault"
  exit 1
fi

VAULT_PATH="$1"

if [ ! -d "$VAULT_PATH" ]; then
  echo "Error: Vault path does not exist: $VAULT_PATH"
  exit 1
fi

THEME_DIR="$VAULT_PATH/.obsidian/themes/$THEME_NAME"

cd "$REPO_ROOT"

echo "→ Building theme..."
npm run build

echo "→ Installing to $THEME_DIR..."
mkdir -p "$THEME_DIR"
cp theme.css manifest.json "$THEME_DIR/"

echo "✓ Done. In Obsidian: Settings → Appearance → Themes → select '$THEME_NAME'."
