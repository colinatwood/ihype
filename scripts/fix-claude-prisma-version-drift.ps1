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

$packagePath = Join-Path $ClaudeRepo "package.json"
$lockPath = Join-Path $ClaudeRepo "package-lock.json"
$safeDir = $ClaudeRepo -replace '\\', '/'

if (-not (Test-Path -LiteralPath $packagePath)) {
  throw "package.json not found: $packagePath"
}

if (-not (Test-Path -LiteralPath $lockPath)) {
  throw "package-lock.json not found: $lockPath"
}

Write-Host "Restoring package-lock.json from the latest Claude commit..."
$lockContent = git -c "safe.directory=$safeDir" -C $ClaudeRepo show HEAD:package-lock.json
$lockContent | Set-Content -LiteralPath $lockPath

Write-Host "Keeping Prisma packages on the same major/minor line..."
$packageJson = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
$packageJson.dependencies."@prisma/client" = "^6.19.3"
$packageJson.devDependencies.prisma = "^6.19.3"
$packageJson.scripts."vercel-build" = "prisma generate && next build"

$packageJson |
  ConvertTo-Json -Depth 20 |
  Set-Content -LiteralPath $packagePath

Write-Host "Regenerating Prisma client..."
npm --prefix $ClaudeRepo run prisma:generate

Write-Host "Done. Verify with:"
Write-Host "cd `"$ClaudeRepo`""
Write-Host "node_modules\.bin\tsc.cmd --noEmit"
