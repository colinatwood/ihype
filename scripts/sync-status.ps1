$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$gitDir = Join-Path $repoRoot ".git-deploy"
$claudeRepo = "C:\Users\djgre\OneDrive\Desktop\Claude iHYPE\ihype-app"

Write-Host "Codex sync repo"
git "--git-dir=$gitDir" "--work-tree=$repoRoot" status --short --branch
git "--git-dir=$gitDir" "--work-tree=$repoRoot" log --oneline -3

Write-Host ""
Write-Host "Claude app repo"
git -c safe.directory="C:/Users/djgre/OneDrive/Desktop/Claude iHYPE/ihype-app" `
  -C $claudeRepo `
  status --short --branch
git -c safe.directory="C:/Users/djgre/OneDrive/Desktop/Claude iHYPE/ihype-app" `
  -C $claudeRepo `
  log --oneline -3

Write-Host ""
Write-Host "Imported Claude branch in Codex"
git "--git-dir=$gitDir" "--work-tree=$repoRoot" branch -r
git "--git-dir=$gitDir" "--work-tree=$repoRoot" diff --stat main..claude-app/main
