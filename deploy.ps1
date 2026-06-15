# ============================================================
# deploy.ps1 — Static Cloudflare Pages Deployment
# ============================================================

Write-Host "Starting deployment..." -ForegroundColor Cyan

# Ensure we are in the correct folder
$expectedFiles = @("index.html", "map.html", "map.js", "main_style_v3.5.5.css")
$missing = @()

foreach ($file in $expectedFiles) {
    if (-not (Test-Path $file)) {
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Host "Warning: The following expected files were not found:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

Write-Host "Deploying current directory to Cloudflare Pages..." -ForegroundColor Cyan

npx wrangler pages deploy .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
}
