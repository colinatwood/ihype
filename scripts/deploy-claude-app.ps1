param(
  [string]$ClaudeRepo = "C:\Users\djgre\OneDrive\Desktop\Claude iHYPE\ihype-app",
  [string]$Token = $env:VERCEL_TOKEN,
  [switch]$SkipVercel
)

$ErrorActionPreference = "Stop"

$Token = $Token.Trim()

$safeDir = "C:/Users/djgre/OneDrive/Desktop/Claude iHYPE/ihype-app"
$syncRoot = Split-Path -Parent $PSScriptRoot
$sandboxVercelCli = Join-Path $syncRoot ".tools\vercel-cli\node_modules\.bin\vercel.cmd"
$userVercelCli = Join-Path $env:APPDATA "npm\vercel.cmd"
$vercelCli = if (Test-Path -LiteralPath $sandboxVercelCli) { $sandboxVercelCli } else { $userVercelCli }
$sandboxData = Join-Path $syncRoot ".vercel-sandbox-data"

function Assert-CommandSucceeded {
  param([string]$Step)

  $exitCode = $global:LASTEXITCODE

  if ($null -ne $exitCode -and $exitCode -ne 0) {
    throw "$Step failed. Exit code: $exitCode. Check the command output directly above this message for the Vercel/Git error."
  }
}

if (-not (Test-Path -LiteralPath $ClaudeRepo)) {
  throw "Claude app repo not found: $ClaudeRepo"
}

Push-Location $ClaudeRepo
try {
  Write-Host "1. Checking Git status..."
  git -c "safe.directory=$safeDir" status --short --branch
  Assert-CommandSucceeded "Git status"

  $trackedChanges = git -c "safe.directory=$safeDir" status --porcelain |
    Where-Object { $_ -notmatch '^\?\? \.claude/' -and $_ -notmatch '^\?\? \.npm-cache/' }

  if ($trackedChanges) {
    Write-Host ""
    Write-Host "Tracked changes are present. Commit them before deploying:" -ForegroundColor Yellow
    $trackedChanges | ForEach-Object { Write-Host $_ }
    exit 1
  }

  Write-Host ""
  Write-Host "2. Verifying Prisma/client package versions..."
  node -e "const c=require('@prisma/client/package.json').version; const p=require('prisma/package.json').version; console.log('@prisma/client', c); console.log('prisma', p); if (c.split('.')[0] !== p.split('.')[0]) process.exit(1)"
  Assert-CommandSucceeded "Prisma version check"

  Write-Host ""
  Write-Host "3. Running TypeScript check..."
  .\node_modules\.bin\tsc.cmd --noEmit
  Assert-CommandSucceeded "TypeScript check"

  Write-Host ""
  Write-Host "4. Pushing main to GitHub..."
  git -c "safe.directory=$safeDir" push origin main
  Assert-CommandSucceeded "GitHub push"

  if ($SkipVercel) {
    Write-Host ""
    Write-Host "Skipped Vercel CLI deploy. GitHub push should trigger Vercel if Git integration is enabled."
    exit 0
  }

  if (-not (Test-Path -LiteralPath $vercelCli)) {
    throw "Vercel CLI not found. Install sandbox CLI with: npm install vercel@latest --prefix .tools\vercel-cli --cache .npm-cache --no-audit --no-fund"
  }

  $env:NO_UPDATE_NOTIFIER = "1"
  $env:VERCEL_NO_UPDATE_NOTIFIER = "1"
  $env:VERCEL_TELEMETRY_DISABLED = "1"
  $env:CI = "1"

  if ($vercelCli -eq $sandboxVercelCli) {
    $env:APPDATA = Join-Path $sandboxData "appdata"
    $env:HOME = Join-Path $sandboxData "home"
    $env:USERPROFILE = $env:HOME

    New-Item -ItemType Directory -Force -Path `
      (Join-Path $env:APPDATA "com.vercel.cli\Data"), `
      $env:HOME |
      Out-Null

    foreach ($fileName in @("config.json", "auth.json")) {
      $configFile = Join-Path $env:APPDATA "com.vercel.cli\Data\$fileName"
      if (-not (Test-Path -LiteralPath $configFile)) {
        Set-Content -LiteralPath $configFile -Value "{}" -NoNewline
      }
    }
  }

  Write-Host ""
  Write-Host "5. Deploying to Vercel production..."

  $deployArgs = @("deploy", "--prod", "--yes")
  if ($Token) {
    if ($Token -match "\s" -or $Token -match "-" -or $Token -match "^(sk-|sk-proj-|cf-|Bearer\s|--token)") {
      throw "The supplied Vercel token value does not look valid. Paste the token value from Vercel Account Settings > Tokens only, not a token name, OpenAI key, Cloudflare key, or full command. Vercel token values should not contain spaces or hyphens."
    }

    $deployArgs += @("-t", $Token)
  } else {
    Write-Host "No VERCEL_TOKEN found in this shell. The CLI must already be logged in, or deploy will fail." -ForegroundColor Yellow
  }

  & $vercelCli @deployArgs
  Assert-CommandSucceeded "Vercel production deploy"

  Write-Host ""
  Write-Host "Deployment command complete."
}
finally {
  Pop-Location
}
