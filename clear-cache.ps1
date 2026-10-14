# Clear all Next.js and build caches
Write-Host "Clearing Next.js caches..." -ForegroundColor Cyan

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
}

# Remove .turbo directory
if (Test-Path ".turbo") {
    Remove-Item -Recurse -Force ".turbo"
    Write-Host "✓ Removed .turbo directory" -ForegroundColor Green
}

# Remove node_modules cache
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host "`nAll caches cleared successfully!" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Yellow
