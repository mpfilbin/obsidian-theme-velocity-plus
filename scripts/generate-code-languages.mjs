// Generate src/20_markdown/_code-languages.scss: per-language name, brand color and icon for the
// code block banner (Style Settings: "Code block language banner").
//
// Icons and brand colors come from Simple Icons (CC0-1.0, https://simpleicons.org). The output is
// committed, so building the theme needs nothing extra; run this only to change the language list:
//
//   npm install --no-save simple-icons
//   node scripts/generate-code-languages.mjs [path/to/simple-icons]

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = resolve(process.argv[2] ?? join(root, "node_modules", "simple-icons"));
const out = join(root, "src", "20_markdown", "_code-languages.scss");

// [display name, aliases used after the opening fence, Simple Icons slug | null, fallback color | null]
// The first alias is the canonical one. With no slug there is no icon; with no color the banner
// stays neutral.
const languages = [
  ["ABAP", ["abap"], null, null],
  ["Apache", ["apache"], "apache", null],
  ["AppleScript", ["applescript"], null, null],
  ["Bash", ["bash"], "gnubash", null],
  ["Batch", ["bat", "batch"], null, null],
  ["C", ["c"], "c", null],
  ["C++", ["cpp", "c++", "cxx", "cc"], "cplusplus", null],
  ["C#", ["csharp", "cs"], null, "#512BD4"],
  ["Clojure", ["clojure", "clj"], "clojure", null],
  ["CMake", ["cmake"], "cmake", null],
  ["CSS", ["css"], null, "#1572B6"],
  ["Dart", ["dart"], "dart", null],
  ["Diff", ["diff", "patch"], null, null],
  ["Dockerfile", ["dockerfile", "docker"], "docker", null],
  ["Elixir", ["elixir"], "elixir", null],
  ["Erlang", ["erlang"], "erlang", null],
  ["F#", ["fsharp", "fs"], "fsharp", null],
  ["Fish", ["fish"], null, null],
  ["Go", ["go", "golang"], "go", null],
  ["GraphQL", ["graphql", "gql"], "graphql", null],
  ["Groovy", ["groovy"], null, "#4298B8"],
  ["Haskell", ["haskell", "hs"], "haskell", null],
  ["HCL", ["hcl"], null, null],
  ["HTML", ["html"], "html5", null],
  ["INI", ["ini"], null, null],
  ["Java", ["java"], "openjdk", null],
  ["JavaScript", ["javascript", "js", "mjs", "cjs"], "javascript", null],
  ["JSON", ["json", "jsonc", "json5"], "json", null],
  ["JSX", ["jsx"], "react", null],
  ["Julia", ["julia", "jl"], "julia", null],
  ["Kotlin", ["kotlin", "kt"], "kotlin", null],
  ["LaTeX", ["latex", "tex"], "latex", null],
  ["Less", ["less"], null, null],
  ["Lisp", ["lisp"], null, "#3FB68B"],
  ["Lua", ["lua"], "lua", null],
  ["Makefile", ["makefile", "make"], null, null],
  ["Markdown", ["markdown", "md"], "markdown", null],
  ["MATLAB", ["matlab"], null, "#E16737"],
  ["Nginx", ["nginx"], "nginx", null],
  ["Nix", ["nix"], null, "#5277C3"],
  ["Objective-C", ["objc", "objectivec"], null, "#438EFF"],
  ["OCaml", ["ocaml", "ml"], "ocaml", null],
  ["Perl", ["perl", "pl"], "perl", null],
  ["PHP", ["php"], "php", null],
  ["PowerShell", ["powershell", "ps1", "pwsh"], null, "#5391FE"],
  ["Protobuf", ["protobuf", "proto"], null, null],
  ["Python", ["python", "py"], "python", null],
  ["R", ["r"], "r", null],
  ["Ruby", ["ruby", "rb"], "ruby", null],
  ["Rust", ["rust", "rs"], "rust", null],
  ["Scala", ["scala"], "scala", null],
  ["SCSS", ["scss", "sass"], "sass", null],
  ["Shell", ["shell", "sh", "shellscript", "zsh"], "gnubash", null],
  ["SQL", ["sql"], "sqlite", null],
  ["Swift", ["swift"], "swift", null],
  ["Terraform", ["terraform", "tf"], "terraform", null],
  ["Text", ["text", "txt", "plaintext"], null, null],
  ["TOML", ["toml"], "toml", null],
  ["TSX", ["tsx"], "react", null],
  ["TypeScript", ["typescript", "ts"], "typescript", null],
  ["Visual Basic", ["vb", "vbnet"], null, null],
  ["Vim", ["vim"], "vim", null],
  ["XML", ["xml"], "xml", null],
  ["YAML", ["yaml", "yml"], "yaml", null],
];

const data = JSON.parse(readFileSync(join(pkg, "data", "simple-icons.json"), "utf8"));
const colorOf = (slug) => {
  const entry = data.find((i) => (i.slug ?? i.title.toLowerCase().replace(/[^a-z0-9]/g, "")) === slug);
  return entry ? `#${entry.hex}` : null;
};

// Near-black brand colors (Rust, Markdown, ...) vanish on dark code blocks, so use a mid gray.
function legible(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 0.15 ? "#9a9a9a" : hex.toUpperCase();
}

const scssString = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const esc = (s) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`); // CSS identifier escape (c++ -> c\+\+)

let rules = "";
let icons = 0;
for (const [name, aliases, slug, fallback] of languages) {
  let color = fallback;
  let icon = null;
  if (slug) {
    const svg = readFileSync(join(pkg, "icons", `${slug}.svg`), "utf8");
    const path = svg.match(/<path d="([^"]+)"/)?.[1];
    if (!path) throw new Error(`No path in ${slug}.svg`);
    color = colorOf(slug) ?? fallback;
    if (color) color = legible(color);
    const fill = (color ?? "#9a9a9a").replaceAll("#", "%23");
    icon = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='${fill}' d='${path}'/%3E%3C/svg%3E")`;
    icons++;
  } else if (color) {
    color = legible(color);
  }
  const selector = aliases.map((a) => `pre.language-${esc(a)}`).join(",\n\t");
  rules += `\n\t${selector} {\n\t\t--code-lang-name: ${scssString(name)};\n`;
  if (color) rules += `\t\t--code-lang-color: ${color};\n\t\t--code-lang-tint: 16%;\n`;
  if (icon) rules += `\t\t--code-lang-icon: ${icon};\n\t\t--code-lang-icon-space: 2.75rem;\n`;
  rules += "\t}\n";
}

writeFileSync(
  out,
  `// GENERATED by scripts/generate-code-languages.mjs - edit that script, not this file.
// Language names, brand colors and icons for the code block banner. Icons and colors are from
// Simple Icons (CC0-1.0, https://simpleicons.org); logos remain trademarks of their owners.

body.code-language-banner .markdown-rendered {${rules}}
`,
);
console.log(`Wrote ${out}: ${languages.length} languages, ${icons} icons`);
