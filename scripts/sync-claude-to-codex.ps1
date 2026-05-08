$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$gitDir = Join-Path $repoRoot ".git-deploy"
$claudeRepo = "C:\Users\djgre\OneDrive\Desktop\Claude iHYPE\ihype-app"
$bundleDir = Join-Path $repoRoot ".sync-bundles"
$bundlePath = Join-Path $bundleDir "claude-app-main.bundle"

New-Item -ItemType Directory -Force -Path $bundleDir | Out-Null

git -c safe.directory="C:/Users/djgre/OneDrive/Desktop/Claude iHYPE/ihype-app" `
  -C $claudeRepo `
  bundle create $bundlePath main

git "--git-dir=$gitDir" "--work-tree=$repoRoot" `
  fetch $bundlePath main:refs/remotes/claude-app/main

Write-Host ""
Write-Host "Claude committed main imported as claude-app/main."
Write-Host "Review before merging:"
Write-Host "git --git-dir=.git-deploy --work-tree=. diff --stat main..claude-app/main"
