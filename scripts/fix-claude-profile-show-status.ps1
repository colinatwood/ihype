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

$routePath = Join-Path $ClaudeRepo "src\app\api\profile\[slug]\route.ts"

if (-not (Test-Path -LiteralPath $routePath)) {
  throw "Route file not found: $routePath"
}

$content = Get-Content -LiteralPath $routePath -Raw

if ($content -notmatch "import \{ ShowStatus \} from '@prisma/client';") {
  $content = $content -replace "import \{ NextResponse \} from 'next/server';\r?\n", "import { NextResponse } from 'next/server';`r`nimport { ShowStatus } from '@prisma/client';`r`n"
}

$content = $content -replace "status: \{ in: \['SCHEDULED', 'LIVE'\] as const \}", "status: { in: [ShowStatus.SCHEDULED, ShowStatus.LIVE] }"

Set-Content -LiteralPath $routePath -Value $content -NoNewline

Write-Host "Fixed Prisma ShowStatus filter in:"
Write-Host $routePath
