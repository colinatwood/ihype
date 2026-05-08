param(
  [string]$Message = "feat: commit Claude app updates"
)

$ErrorActionPreference = "Stop"

$claudeRepo = "C:\Users\djgre\OneDrive\Desktop\Claude iHYPE\ihype-app"
$safeDir = "C:/Users/djgre/OneDrive/Desktop/Claude iHYPE/ihype-app"

if (-not (Test-Path -LiteralPath $claudeRepo)) {
  throw "Claude app repo not found: $claudeRepo"
}

Write-Host "Checking Claude app repo..."
git -c "safe.directory=$safeDir" -C $claudeRepo status --short --branch

$secretHits = git -c "safe.directory=$safeDir" -C $claudeRepo diff |
  Select-String -Pattern "sk-proj-|OPENAI_API_KEY\s*=\s*['""][^'""]+|AUTH_SECRET\s*=\s*['""][^'""]+|DATABASE_URL\s*=\s*['""][^'""]+|MUX_TOKEN_SECRET\s*=\s*['""][^'""]+"

if ($secretHits) {
  Write-Host ""
  Write-Host "Potential secret values found in pending tracked-file diff. Commit stopped." -ForegroundColor Red
  $secretHits | ForEach-Object { Write-Host $_.Line }
  exit 1
}

$files = @(
  "next.config.mjs",
  "public/manifest.json",
  "public/sw.js",
  "src/app/api/artist-media/route.ts",
  "src/app/api/profile/[slug]/route.ts",
  "src/app/api/shows/[showId]/route.ts",
  "src/app/hype/page.tsx",
  "src/app/tickets/page.tsx",
  "src/app/artists/[slug]/page.tsx",
  "src/app/profile/[slug]/route.ts",
  "src/app/shows/[slug]/page.tsx",
  "src/components/PublicFeaturePage.tsx",
  "src/components/TicketSaleCard.tsx"
)

Write-Host ""
Write-Host "Staging Claude app files, excluding local .claude config..."
git -c "safe.directory=$safeDir" -C $claudeRepo add -- $files

Write-Host ""
Write-Host "Committing..."
git -c "safe.directory=$safeDir" -C $claudeRepo commit -m $Message

Write-Host ""
Write-Host "Claude app commit complete."
git -c "safe.directory=$safeDir" -C $claudeRepo status --short --branch
git -c "safe.directory=$safeDir" -C $claudeRepo log --oneline -3
