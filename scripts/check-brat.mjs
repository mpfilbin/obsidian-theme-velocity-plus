// Check that a GitHub repo can be installed as a theme with BRAT, by fetching
// exactly what BRAT fetches (see obsidian42-brat src/features/themes.ts):
//   https://raw.githubusercontent.com/<repo>/HEAD/theme-beta.css  (preferred, optional)
//   https://raw.githubusercontent.com/<repo>/HEAD/theme.css
//   https://raw.githubusercontent.com/<repo>/HEAD/manifest.json
// BRAT installs the theme into .obsidian/themes/<manifest.name> and detects updates
// from a checksum of that CSS file, not from GitHub releases.
//
//   node scripts/check-brat.mjs [owner/repo]
//
// Without an argument, the repo is read from the `origin` git remote.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function repoFromRemote() {
  try {
    const url = execSync("git remote get-url origin", { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return url.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/)?.[1] ?? null;
  } catch {
    return null;
  }
}

const originRepo = repoFromRemote();
const repo = (process.argv[2] ?? originRepo ?? "").replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
  console.error("Usage: node scripts/check-brat.mjs <owner/repo>");
  console.error("(No GitHub `origin` remote found to default to.)");
  process.exit(2);
}

const raw = (file) => `https://raw.githubusercontent.com/${repo}/HEAD/${file}`;
async function fetchText(file) {
  const res = await fetch(raw(file));
  return res.ok ? res.text() : null;
}

let failed = false;
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  console.log(`  ✗ ${msg}`);
  failed = true;
};
const warn = (msg) => console.log(`  ! ${msg}`);

console.log(`Checking ${repo} the way BRAT installs themes...\n`);

const beta = await fetchText("theme-beta.css");
const css = beta ?? (await fetchText("theme.css"));
const cssFile = beta ? "theme-beta.css" : "theme.css";
if (css === null) {
  fail(`No theme.css on the default branch (${raw("theme.css")}). Is the repo public, and is theme.css committed?`);
} else {
  pass(`${cssFile} found on the default branch (${css.length} bytes)`);
  if (beta) warn("theme-beta.css exists, so BRAT installs it instead of theme.css.");
  if (css.trim().length === 0) fail(`${cssFile} is empty`);
  if (!css.includes("@settings")) warn(`${cssFile} has no Style Settings block`);
}

const manifestText = await fetchText("manifest.json");
let manifest = null;
if (manifestText === null) {
  fail(`No manifest.json on the default branch (${raw("manifest.json")})`);
} else {
  try {
    manifest = JSON.parse(manifestText);
    pass("manifest.json found and is valid JSON");
  } catch (e) {
    fail(`manifest.json is not valid JSON: ${e.message}`);
  }
}

if (manifest) {
  if (typeof manifest.name === "string" && manifest.name.trim().length > 0) {
    pass(`BRAT will install into .obsidian/themes/${manifest.name}`);
  } else {
    fail("manifest.json has no `name`, which BRAT uses as the theme folder");
  }
  for (const key of ["version", "minAppVersion", "author"]) {
    if (!manifest[key]) fail(`manifest.json is missing required \`${key}\``);
  }
  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) fail("manifest.json version must be x.y.z");
}

// For this repo's own remote, compare against a fresh local build so a stale commit is caught.
if (css !== null && !beta && repo.toLowerCase() === originRepo?.toLowerCase()) {
  try {
    execSync("node scripts/build.mjs", { cwd: root, stdio: "ignore" });
    const local = readFileSync(join(root, "theme.css"), "utf8").replace(/\r\n/g, "\n");
    if (local === css.replace(/\r\n/g, "\n")) pass("Published theme.css matches a fresh local build");
    else
      warn(
        "Published theme.css differs from a fresh local build: unpushed changes, a stale commit, " +
          "or GitHub's raw-file cache (it can lag a few minutes after a push — retry shortly)"
      );
  } catch {
    warn("Couldn't build locally to compare");
  }
}

console.log(failed ? "\nBRAT install would FAIL." : `\nBRAT can install this theme: add "${repo}" under BRAT → Add beta theme.`);
process.exit(failed ? 1 : 0);
