# PowerShell script to update Footer to hide on mobile

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
    
    # Check if already updated
    if ($content -like "*{/* Footer - Desktop Only */*}*") {
        Write-Host "SKIP: $file (already updated)" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    # Update Footer comment and add hidden class for mobile
    $oldFooter = "    {/* Footer */}`r`n    <Footer />"
    $newFooter = "    {/* Footer - Desktop Only */}`r`n    <div className=`"hidden md:block`">`r`n      <Footer />`r`n    </div>"
    
    if ($content -like "*$oldFooter*") {
        $content = $content.Replace($oldFooter, $newFooter)
        Set-Content $file $content -NoNewline
        Write-Host "SUCCESS: $file" -ForegroundColor Green
        $success++
    } else {
        Write-Host "SKIP: $file (pattern not found)" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Updated: $success | Skipped: $skipped" -ForegroundColor Cyan
