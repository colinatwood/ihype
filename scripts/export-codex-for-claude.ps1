$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$gitDir = Join-Path $repoRoot ".git-deploy"
$bundleDir = Join-Path $repoRoot ".sync-bundles"
$bundlePath = Join-Path $bundleDir "codex-main.bundle"

New-Item -ItemType Directory -Force -Path $bundleDir | Out-Null

git "--git-dir=$gitDir" "--work-tree=$repoRoot" `
  bundle create $bundlePath main

Write-Host ""
Write-Host "Codex main exported to:"
Write-Host $bundlePath
Write-Host ""
Write-Host "From the Claude app repo, import it with:"
Write-Host "git fetch `"$bundlePath`" main:refs/remotes/codex/main"
Write-Host "git diff --stat main..codex/main"
