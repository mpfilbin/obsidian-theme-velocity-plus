#Requires -Version 5.1
[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$VaultPath
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot

# Read the name from manifest.json; Obsidian requires the theme folder to match it exactly.
$manifest = Get-Content -LiteralPath (Join-Path $RepoRoot 'manifest.json') -Raw | ConvertFrom-Json
$ThemeName = $manifest.name
if (-not ($ThemeName -is [string]) -or $ThemeName.Length -eq 0) {
  throw 'manifest.json is missing a valid theme name'
}

if (-not $VaultPath) {
  Write-Host 'Usage: .\scripts\install.ps1 <path-to-obsidian-vault>'
  Write-Host ''
  Write-Host 'Example: .\scripts\install.ps1 C:\Users\me\Documents\MyVault'
  exit 1
}

if (-not (Test-Path -LiteralPath $VaultPath -PathType Container)) {
  Write-Host "Error: Vault path does not exist: $VaultPath"
  exit 1
}

$ThemeDir = Join-Path $VaultPath ".obsidian\themes\$ThemeName"

Push-Location $RepoRoot
try {
  Write-Host '-> Building theme...'
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed with exit code $LASTEXITCODE"
  }

  Write-Host "-> Installing to $ThemeDir..."
  New-Item -ItemType Directory -Path $ThemeDir -Force | Out-Null
  foreach ($file in 'theme.css', 'manifest.json') {
    Copy-Item -LiteralPath (Join-Path $RepoRoot $file) -Destination $ThemeDir -Force
  }
} finally {
  Pop-Location
}

Write-Host "Done. In Obsidian: Settings -> Appearance -> Themes -> select '$ThemeName'."
