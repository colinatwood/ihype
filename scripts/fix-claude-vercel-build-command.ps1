param(
  [string]$ClaudeRepo = "C:\Users\djgre\OneDrive\Desktop\Claude iHYPE\ihype-app"
)

$ErrorActionPreference = "Stop"

$packagePath = Join-Path $ClaudeRepo "package.json"
$vercelPath = Join-Path $ClaudeRepo "vercel.json"

if (-not (Test-Path -LiteralPath $packagePath)) {
  throw "package.json not found: $packagePath"
}

if (-not (Test-Path -LiteralPath $vercelPath)) {
  throw "vercel.json not found: $vercelPath"
}

$packageJson = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json

if (-not $packageJson.scripts) {
  throw "package.json has no scripts section."
}

$packageJson.scripts."vercel-build" = "prisma generate && next build"

$packageJson |
  ConvertTo-Json -Depth 20 |
  Set-Content -LiteralPath $packagePath

$vercelJson = Get-Content -LiteralPath $vercelPath -Raw | ConvertFrom-Json
$vercelJson.buildCommand = "npm run vercel-build"

$vercelJson |
  ConvertTo-Json -Depth 20 |
  Set-Content -LiteralPath $vercelPath

Write-Host "Updated Claude app Vercel build command."
Write-Host "vercel-build now runs: prisma generate && next build"
Write-Host "Run migrations separately with: npm run prisma:migrate:deploy"
