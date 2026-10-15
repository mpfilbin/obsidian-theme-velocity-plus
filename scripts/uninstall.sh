#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
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

OBSIDIAN_DIR="$VAULT_PATH/.obsidian"
THEME_DIR="$OBSIDIAN_DIR/themes/$THEME_NAME"
APPEARANCE_FILE="$OBSIDIAN_DIR/appearance.json"

if [ -d "$THEME_DIR" ]; then
  echo "→ Removing theme directory $THEME_DIR..."
  rm -rf "$THEME_DIR"
else
  echo "→ Theme directory not found at $THEME_DIR; nothing to delete."
fi

if [ ! -d "$OBSIDIAN_DIR" ]; then
  echo "→ Obsidian config directory not found at $OBSIDIAN_DIR; skipping appearance cleanup."
  echo "✓ Done."
  exit 0
fi

if [ ! -f "$APPEARANCE_FILE" ]; then
  echo "→ appearance.json not found at $APPEARANCE_FILE; skipping appearance cleanup."
  echo "✓ Done."
  exit 0
fi

echo "→ Resetting the active theme in $APPEARANCE_FILE if it is '$THEME_NAME'..."
if UPDATE_RESULT="$(THEME_NAME="$THEME_NAME" APPEARANCE_FILE="$APPEARANCE_FILE" node <<'NODE'
const fs = require('node:fs');

const themeName = process.env.THEME_NAME;
const appearanceFile = process.env.APPEARANCE_FILE;

const parsed = JSON.parse(fs.readFileSync(appearanceFile, 'utf8'));

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  console.error(`Expected ${appearanceFile} to contain a JSON object.`);
  process.exit(1);
}

if (parsed.cssTheme === themeName) {
  // An empty cssTheme is Obsidian's default theme.
  parsed.cssTheme = '';
  fs.writeFileSync(appearanceFile, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
  process.stdout.write('reset');
} else {
  process.stdout.write('not-active');
}
NODE
)"; then
  if [ "$UPDATE_RESULT" = "reset" ]; then
    echo "✓ Done. Theme files removed and the vault switched back to the default theme."
  else
    echo "✓ Done. Theme files removed; '$THEME_NAME' was not the active theme."
  fi
else
  echo "Error: Failed to update $APPEARANCE_FILE. The theme directory has been removed, but the vault may still reference '$THEME_NAME'."
  exit 1
fi
