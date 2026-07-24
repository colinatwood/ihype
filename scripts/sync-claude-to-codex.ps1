param(
  # Personal local-sync script (one contributor's own Claude Desktop
  # checkout, not part of CI or the deployed app) — pass -ClaudeRepo or set
  # $env:IHYPE_CLAUDE_APP_REPO rather than relying on a hardcoded path that
  # would silently be wrong for anyone else who runs this.
  [string]$ClaudeRepo = $env:IHYPE_CLAUDE_APP_REPO
)

$ErrorActionPreference = "Stop"

if (-not $ClaudeRepo) {
  throw "Set -ClaudeRepo <path> or `$env:IHYPE_CLAUDE_APP_REPO to your local Claude app checkout."
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$gitDir = Join-Path $repoRoot ".git-deploy"
$claudeRepo = $ClaudeRepo
$safeDir = $ClaudeRepo -replace '\\', '/'
$bundleDir = Join-Path $repoRoot ".sync-bundles"
$bundlePath = Join-Path $bundleDir "claude-app-main.bundle"

New-Item -ItemType Directory -Force -Path $bundleDir | Out-Null

git -c safe.directory="$safeDir" `
  -C $claudeRepo `
  bundle create $bundlePath main

git "--git-dir=$gitDir" "--work-tree=$repoRoot" `
  fetch $bundlePath main:refs/remotes/claude-app/main

Write-Host ""
Write-Host "Claude committed main imported as claude-app/main."
Write-Host "Review before merging:"
Write-Host "git --git-dir=.git-deploy --work-tree=. diff --stat main..claude-app/main"
