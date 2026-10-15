// Compile src/theme.scss and append the Style Settings blocks to produce theme.css.
// Node port of Velocity's compile.dart.
//
//   node scripts/build.mjs           one-shot build
//   node scripts/build.mjs --watch   rebuild on changes under src/
//
// Set OBSIDIAN_THEME_DIR to also copy manifest.json and theme.css into a vault,
// e.g. OBSIDIAN_THEME_DIR="C:/Vault/.obsidian/themes/Velocity Plus".

import { copyFileSync, existsSync, mkdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "src", "theme.scss");
const settingsFiles = ["style-settings.css", "style-settings-plus.css"].map((f) => join(root, "src", f));
const out = join(root, "theme.css");
const vaultDir = process.env.OBSIDIAN_THEME_DIR;

function build() {
  // charset: false keeps Sass from prepending a BOM when sources contain non-ASCII.
  const { css } = sass.compile(entry, { style: "compressed", charset: false });
  const settings = settingsFiles.filter(existsSync).map((f) => readFileSync(f, "utf8"));
  const combined = [css, ...settings].join("\n");
  writeFileSync(out, combined);

  if (vaultDir) {
    mkdirSync(vaultDir, { recursive: true });
    copyFileSync(out, join(vaultDir, "theme.css"));
    copyFileSync(join(root, "manifest.json"), join(vaultDir, "manifest.json"));
  }
  return combined.length;
}

function tryBuild(reason) {
  try {
    const bytes = build();
    console.log(`${reason}: wrote theme.css (${bytes} bytes)${vaultDir ? ` → ${vaultDir}` : ""}`);
    return true;
  } catch (e) {
    console.error(e instanceof sass.Exception ? `Sass error: ${e.message}` : e);
    return false;
  }
}

if (process.argv.includes("--watch")) {
  tryBuild("Initial build");
  let timer;
  watch(join(root, "src"), { recursive: true }, (_event, file) => {
    if (!file || !/\.(scss|css)$/.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(() => tryBuild(`Rebuilt (${file})`), 250);
  });
  console.log("Watching src/ for changes");
} else if (!tryBuild("Built")) {
  process.exit(1);
}
