param(
  [string]$ClaudeRepo = "C:\Users\djgre\OneDrive\Desktop\Claude iHYPE\ihype-app"
)

$ErrorActionPreference = "Stop"

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
