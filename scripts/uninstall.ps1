#Requires -Version 5.1
[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$VaultPath
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot

if (-not $VaultPath) {
  Write-Host 'Usage: .\scripts\uninstall.ps1 <path-to-obsidian-vault>'
  Write-Host ''
  Write-Host 'Example: .\scripts\uninstall.ps1 C:\Users\me\Documents\MyVault'
  exit 1
}

if (-not (Test-Path -LiteralPath $VaultPath -PathType Container)) {
  Write-Host "Error: Vault path does not exist: $VaultPath"
  exit 1
}

# Read the name from manifest.json so it stays in sync with the theme folder.
$manifest = Get-Content -LiteralPath (Join-Path $RepoRoot 'manifest.json') -Raw | ConvertFrom-Json
$ThemeName = $manifest.name
if (-not ($ThemeName -is [string]) -or $ThemeName.Length -eq 0) {
  throw 'manifest.json is missing a valid theme name'
}

$ObsidianDir = Join-Path $VaultPath '.obsidian'
$ThemeDir = Join-Path $ObsidianDir "themes\$ThemeName"
$AppearanceFile = Join-Path $ObsidianDir 'appearance.json'

if (Test-Path -LiteralPath $ThemeDir) {
  Write-Host "-> Removing theme directory $ThemeDir..."
  Remove-Item -LiteralPath $ThemeDir -Recurse -Force
} else {
  Write-Host "-> Theme directory not found at $ThemeDir; nothing to delete."
}

if (-not (Test-Path -LiteralPath $ObsidianDir -PathType Container)) {
  Write-Host "-> Obsidian config directory not found at $ObsidianDir; skipping appearance cleanup."
  Write-Host 'Done.'
  exit 0
}

if (-not (Test-Path -LiteralPath $AppearanceFile -PathType Leaf)) {
  Write-Host "-> appearance.json not found at $AppearanceFile; skipping appearance cleanup."
  Write-Host 'Done.'
  exit 0
}

Write-Host "-> Resetting the active theme in $AppearanceFile if it is '$ThemeName'..."
try {
  $raw = Get-Content -LiteralPath $AppearanceFile -Raw -Encoding UTF8
  if ($raw.TrimStart() -notmatch '^\{') {
    throw "Expected $AppearanceFile to contain a JSON object."
  }
  $appearance = $raw | ConvertFrom-Json

  if ($appearance.cssTheme -eq $ThemeName) {
    # An empty cssTheme is Obsidian's default theme.
    $appearance.cssTheme = ''
    $json = $appearance | ConvertTo-Json -Depth 10
    # Write UTF-8 without a BOM; Windows PowerShell 5.1's Set-Content adds one.
    [System.IO.File]::WriteAllText($AppearanceFile, $json + "`n", (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'Done. Theme files removed and the vault switched back to the default theme.'
  } else {
    Write-Host "Done. Theme files removed; '$ThemeName' was not the active theme."
  }
} catch {
  Write-Host "Error: Failed to update $AppearanceFile. The theme directory has been removed, but the vault may still reference '$ThemeName'."
  Write-Host $_.Exception.Message
  exit 1
}
