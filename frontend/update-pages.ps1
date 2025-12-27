# PowerShell script to add Footer and MobileBottomNav to all shop pages

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
    "src/pages/shop-for-cats/CatFood.jsx"
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
    if ($content -like "*import MobileBottomNav*") {
        Write-Host "SKIP: $file (already updated)" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    # Add MobileBottomNav import
    $content = $content -replace "(import Footer from '../homepage/components/Footer';)", "`$1`r`nimport MobileBottomNav from '../../components/ui/MobileBottomNav';"
    
    # Add components before closing
    $oldEnding = "      </aside>`r`n    </div>`r`n    </>`r`n  );"
    $newEnding = "      </aside>`r`n    </div>`r`n`r`n    {/* Footer */}`r`n    <Footer />`r`n`r`n    {/* Mobile Bottom Navigation */}`r`n    <MobileBottomNav />`r`n    </>`r`n  );"
    $content = $content.Replace($oldEnding, $newEnding)
    
    Set-Content $file $content -NoNewline
    Write-Host "SUCCESS: $file" -ForegroundColor Green
    $success++
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Updated: $success | Skipped: $skipped" -ForegroundColor Cyan
