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

Write-Host "Codex sync repo"
git "--git-dir=$gitDir" "--work-tree=$repoRoot" status --short --branch
git "--git-dir=$gitDir" "--work-tree=$repoRoot" log --oneline -3

Write-Host ""
Write-Host "Claude app repo"
git -c safe.directory="$safeDir" `
  -C $claudeRepo `
  status --short --branch
git -c safe.directory="$safeDir" `
  -C $claudeRepo `
  log --oneline -3

Write-Host ""
Write-Host "Imported Claude branch in Codex"
git "--git-dir=$gitDir" "--work-tree=$repoRoot" branch -r
git "--git-dir=$gitDir" "--work-tree=$repoRoot" diff --stat main..claude-app/main
