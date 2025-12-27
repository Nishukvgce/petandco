# PowerShell script to enable Footer on mobile for all shop pages

$files = @(
    "src/pages/shop-for-dogs/DogTreats.jsx",
    "src/pages/shop-for-dogs/WalkEssentials.jsx",
    "src/pages/shop-for-dogs/DogTravelSupplies.jsx",
    "src/pages/shop-for-dogs/DogTrainingEssentials.jsx",
    "src/pages/shop-for-dogs/DogToys.jsx",
    "src/pages/shop-for-dogs/DogHealthHygiene.jsx",
    "src/pages/shop-for-dogs/DogClothing.jsx",
    "src/pages/shop-for-dogs/DogBowlsDiners.jsx",
    "src/pages/shop-for-dogs/DogBedding.jsx",
    "src/pages/shop-for-cats/CatFood.jsx",
    "src/pages/pharmacy/PharmacyCollectionPage.jsx"
)

$success = 0
$skipped = 0

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "SKIP: $file (not found)" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    $content = Get-Content $file -Raw
    
    # Check if it has the hidden wrapper
    if ($content -match '<div className="hidden md:block">\s*<Footer />\s*</div>') {
        # Replace with just Footer
        $content = $content -replace '<div className="hidden md:block">\s*<Footer />\s*</div>', "`r`n    <Footer />"
        Set-Content $file $content -NoNewline
        Write-Host "SUCCESS: $file (Footer enabled on mobile)" -ForegroundColor Green
        $success++
    } elseif ($content -like "*<Footer />*") {
        Write-Host "SKIP: $file (Footer already visible or different pattern)" -ForegroundColor Gray
        $skipped++
    } else {
        Write-Host "WARNING: $file (Footer not found)" -ForegroundColor Red
        $skipped++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Updated: $success | Skipped: $skipped" -ForegroundColor Cyan
