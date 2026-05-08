param(
  [string]$ClaudeRepo = "C:\Users\djgre\OneDrive\Desktop\Claude iHYPE\ihype-app"
)

$ErrorActionPreference = "Stop"

$vercelDir = Join-Path $ClaudeRepo ".vercel"
$projectPath = Join-Path $vercelDir "project.json"

if (-not (Test-Path -LiteralPath $ClaudeRepo)) {
  throw "Claude app repo not found: $ClaudeRepo"
}

New-Item -ItemType Directory -Force -Path $vercelDir | Out-Null

$project = [ordered]@{
  projectId = "prj_qxep3ZNTORhzTqZtwDnypvVyQxHO"
  orgId = "team_2Y6OYW9TSxuHI8un0ixjOGMB"
  projectName = "ihype"
}

$project |
  ConvertTo-Json |
  Set-Content -LiteralPath $projectPath

Write-Host "Claude app is now linked locally to Vercel project: ihype"
Write-Host "Project ID: prj_qxep3ZNTORhzTqZtwDnypvVyQxHO"
Write-Host "Team ID: team_2Y6OYW9TSxuHI8un0ixjOGMB"
Write-Host ""
Write-Host "Next deploy command:"
Write-Host "powershell -ExecutionPolicy Bypass -File scripts\deploy-claude-app.ps1"
