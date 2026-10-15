# Velocity Plus

My personal Obsidian theme: the core of [Velocity](https://github.com/Gonzalo-D-Sales/obsidian-velocity) by Floodlight, plus the feature classes from [Baseline](https://github.com/svnaxis/obsidian-baseline#features) by svnaxis.

Everything Velocity does — its color schemes, Style Settings, cssclasses, Auto-Hide, and math callouts — works as documented in [Velocity's README](https://github.com/Gonzalo-D-Sales/obsidian-velocity#features). The additions below come from Baseline.

Requires Obsidian 1.14 or later. Install the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin to configure the theme; Baseline's features appear under **Velocity Plus - Baseline Features**, where table, embed, and width classes can also be turned on vault-wide.

## Installation via BRAT

1. Install the [BRAT plugin](https://obsidian.md/plugins?id=obsidian42-brat) from the Obsidian community plugins.
2. In BRAT settings, select **Add beta theme** and enter this repository's `owner/name`.
3. BRAT installs the theme into `.obsidian/themes/Velocity Plus` and switches to it.

BRAT installs themes from `theme.css` and `manifest.json` on the default branch, not from GitHub releases, and it picks up updates whenever the committed `theme.css` changes. Changing only `manifest.json` doesn't trigger an update. GitHub can take a few minutes to serve a newly pushed file, so wait briefly before running **Check for updates** in BRAT.

For a beta channel, commit a `theme-beta.css`: BRAT prefers it over `theme.css` when both exist. Delete it when testing is done so BRAT goes back to `theme.css`.

## Added features

Apply classes per note with the `cssclasses` property.

### Banners

| Class                   | Description                                                                |
| :---------------------- | :------------------------------------------------------------------------- |
| `banner`                | Add to the image link, e.g. `![[image.jpeg\|banner]]`                      |
| `banner-fade`           | Fade the banner's bottom edge (requires `banner`)                          |
| `banner-icon`           | Emoji or letter note icon via callout, e.g. `> [!banner-icon] 👋`          |
| `banner-title`          | Move the inline title next to the icon (requires `banner-icon`)            |
| `y0`, `y5` … `y100`     | Vertical position of the banner image (requires `banner`)                  |

### Block width

| Class                                  | Description                           |
| :------------------------------------- | :------------------------------------ |
| `wide`                                 | Entire note uses the wide line width  |
| `max`                                  | Entire note uses the max line width   |
| `table-100`, `bases-100`, `img-100`    | Fill 100% of the pane width           |
| `table-max`, `bases-max`, `img-max`    | Fill the max line width               |
| `table-wide`, `bases-wide`, `img-wide` | Fill the wide line width              |

Velocity's own `style-wide` class still works as before.

### Cards

| Class                 | Description                                      |
| :-------------------- | :----------------------------------------------- |
| `cards`               | Show Dataview tables as cards                    |
| `list-cards`          | Show bullet lists as cards                       |
| `cards-align-bottom`  | Align the last element of a card to the bottom   |
| `cards-cover`         | Images fill the card's image area                |
| `cards-16-9`, `cards-1-1`, `cards-2-1`, `cards-2-3` | Image aspect ratio |
| `cards-cols-1` … `cards-cols-8` | Force a number of columns              |

### Embeds

| Class              | Description                       |
| :----------------- | :-------------------------------- |
| `embed-strict`     | Remove embed background and border |
| `embed-hide-title` | Hide embedded file titles         |

### Images

Add a filter to the end of an image link, e.g. `![[image.jpeg#invert]]`.

| Filter       | Description                              |
| :----------- | :--------------------------------------- |
| `#blend`     | Blend image into the background          |
| `#invert`    | Invert in dark mode                      |
| `#invertW`   | Invert in light mode                     |
| `#circle`    | Crop to a circle                         |
| `#outline`   | Outline the image                        |
| `#interface` | Drop shadow behind the image             |

Use the `img-grid` class to lay out consecutive images side by side.

### Tables

| Class           | Description                                  |
| :-------------- | :------------------------------------------- |
| `table-nowrap`  | Disable line wrapping in cells               |
| `table-wrap`    | Force line wrapping in cells                 |
| `table-center`  | Center tables narrower than the line width   |
| `table-numbers` | Add row numbers                              |
| `table-tabular` | Use tabular figures                          |
| `table-small`   | Small font size                              |
| `table-tiny`    | Tiny font size                               |
| `table-lines`   | Borders around all cells                     |
| `row-lines`     | Borders between rows                         |
| `col-lines`     | Borders between columns                      |
| `row-alt`       | Striped rows                                 |
| `col-alt`       | Striped columns                              |
| `row-hover`     | Highlight rows on hover                      |

### Bases

| Class           | Description                                   |
| :-------------- | :-------------------------------------------- |
| `bases-row-alt` | Striped rows in table views                   |
| `bases-col-alt` | Striped columns in table views                |
| `bases-plain`   | Hide the toolbar on embedded Bases            |

### Alternate checkboxes

Velocity's checkboxes keep their look and meaning: `[x]` done, `[/]` incomplete, `[-]` canceled, `[<]` scheduled, `[>]` deferred, `[?]` question, `[!]` important, `[f]` failed, `[r]` review, `[s]` savings.

Baseline's additional types are restyled to match:

| Syntax  | Meaning    | Syntax  | Meaning    | Syntax  | Meaning    |
| ------- | ---------- | ------- | ---------- | ------- | ---------- |
| `- [*]` | Star       | `- [I]` | Idea       | `- [+]` | Add        |
| `- ["]` | Quote      | `- [p]` | Pros       | `- [B]` | Brainstorm |
| `- [l]` | Location   | `- [c]` | Cons       | `- [a]` | Alarm      |
| `- [b]` | Bookmark   | `- [k]` | Key        | `- [n]` | Note       |
| `- [i]` | Information| `- [w]` | Win        | `- [R]` | Review     |
| `- [S]` | Savings    | `- [u]` | Up         | `- [t]` | Time       |
|         |            | `- [d]` | Down       | `- [P]` | Phone      |
|         |            |         |            | `- [L]` | Love       |

## Development

Requires Node.js 20+ and Git.

```bash
npm install
npm run build   # compile src/ into theme.css
npm run dev     # rebuild on every change
```

`theme.css` is a build output, but it **is committed**: BRAT installs and updates the theme from the copy on the default branch. Run `npm run build` and commit `theme.css` along with any change under `src/`. CI fails a pull request whose committed `theme.css` doesn't match the source.

To confirm the pushed repo is installable with BRAT, run:

```bash
npm run check:brat              # checks the origin remote
npm run check:brat owner/repo   # or any repo
```

It fetches the same files BRAT fetches, validates the manifest, and warns if the published `theme.css` differs from a fresh local build.

### Install to a local vault for testing

```bash
./scripts/install.sh /path/to/your/vault
./scripts/uninstall.sh /path/to/your/vault
```

On Windows, use the PowerShell equivalents (they work with Windows PowerShell 5.1 or PowerShell 7+):

```powershell
.\scripts\install.ps1 C:\path\to\your\vault
.\scripts\uninstall.ps1 C:\path\to\your\vault
```

`install` builds the theme and copies `theme.css` and `manifest.json` to `<vault>/.obsidian/themes/Velocity Plus`. `uninstall` deletes that folder and, if Velocity Plus is the vault's active theme, switches the vault back to the default theme in `appearance.json`. Then pick the theme under **Settings → Appearance → Themes**. Restart Obsidian after changing `manifest.json`.

If PowerShell refuses to run the scripts because of the execution policy, run them for a single invocation with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 C:\path\to\your\vault
```

For live editing, point the watcher at the vault's theme folder; it copies `theme.css` and `manifest.json` there on every rebuild:

```powershell
$env:OBSIDIAN_THEME_DIR = "C:\path\to\vault\.obsidian\themes\Velocity Plus"
npm run dev
```

### Bump version and prepare a release

```bash
npm run release patch     # or minor / major
git push
```

This bumps `package.json`, syncs the version into `manifest.json` and `versions.json`, and commits the change. `npm run release` runs a bash script, so run it from Git Bash or WSL rather than PowerShell.

The Release GitHub Action builds the theme and publishes a GitHub release, with `theme.css` and `manifest.json` attached, whenever it detects a `manifest.json` change on `master`. The CI action builds every pull request.

### Layout

| Path                     | Contents                                               |
| ------------------------ | ------------------------------------------------------ |
| `src/00_elements`–`70_extras` | Velocity, unchanged                               |
| `src/80_baseline`        | Features adapted from Baseline                         |
| `src/style-settings.css` | Velocity's Style Settings                              |
| `src/style-settings-plus.css` | Style Settings for the Baseline features          |
| `scripts/build.mjs`      | Build script (Node port of Velocity's `compile.dart`)  |
| `scripts/install.*`, `scripts/uninstall.*` | Install/remove the theme in a vault  |
| `scripts/release.sh`     | Version bump (`npm run release`)                       |
| `scripts/check-brat.mjs` | Check the pushed repo installs with BRAT (`npm run check:brat`) |
| `version-bump.mjs`       | Syncs `package.json`'s version into `manifest.json` and `versions.json` |

## License

GPL-3.0, inherited from Velocity. Baseline's code is MIT-licensed; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
