# PowerShell script to add Footer and MobileBottomNav to all shop pages
# This script will:
# 1. Add import statements for Footer and MobileBottomNav
# 2. Add the components before the closing fragment

$ErrorActionPreference = "Stop"

# Define the files to update
$shopForDogsFiles = @(
    "src/pages/shop-for-dogs/DogTreats.jsx",
    "src/pages/shop-for-dogs/DogFood.jsx",
    "src/pages/shop-for-dogs/WalkEssentials.jsx",
    "src/pages/shop-for-dogs/DogTravelSupplies.jsx",
    "src/pages/shop-for-dogs/DogTrainingEssentials.jsx",
    "src/pages/shop-for-dogs/DogToys.jsx",
    "src/pages/shop-for-dogs/DogHealthHygiene.jsx",
    "src/pages/shop-for-dogs/DogClothing.jsx",
    "src/pages/shop-for-dogs/DogBowlsDiners.jsx",
    "src/pages/shop-for-dogs/DogBedding.jsx"
)

$shopForCatsFiles = @(
    "src/pages/shop-for-cats/CatFood.jsx",
    "src/pages/shop-for-cats/CatTreats.jsx",
    "src/pages/shop-for-cats/CatToys.jsx",
    "src/pages/shop-for-cats/CatLitter.jsx",
    "src/pages/shop-for-cats/CatHealthHygiene.jsx",
    "src/pages/shop-for-cats/CatBedding.jsx",
    "src/pages/shop-for-cats/CatBowlsDiners.jsx"
)

$allFiles = $shopForDogsFiles + $shopForCatsFiles

Write-Host "Starting to update shop page files..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$skipCount = 0
$errorCount = 0

foreach ($file in $allFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️  SKIP: $file (file not found)" -ForegroundColor Yellow
        $skipCount++
        continue
    }
    
    try {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        
        # Check if already has MobileBottomNav import
        if ($content -match "import MobileBottomNav") {
            Write-Host "  ✓ Already updated (has MobileBottomNav import)" -ForegroundColor Gray
            $skipCount++
            continue
        }
        
        # Step 1: Add MobileBottomNav import after Footer import
        if ($content -match "import Footer from") {
            $content = $content -replace "(import Footer from '../homepage/components/Footer';)", "`$1`r`nimport MobileBottomNav from '../../components/ui/MobileBottomNav';"
            Write-Host "  ✓ Added MobileBottomNav import" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Footer import not found, skipping" -ForegroundColor Yellow
            $skipCount++
            continue
        }
        
        # Step 2: Add Footer and MobileBottomNav before closing fragment
        # Look for the pattern: </aside>\n    </div>\n    </>\n  );
        $pattern = '</aside>\r?\n\s*</div>\r?\n\s*</>\r?\n\s*\);'
        $replacement = "</aside>`r`n    </div>`r`n`r`n    {/* Footer */}`r`n    <Footer />`r`n`r`n    {/* Mobile Bottom Navigation */}`r`n    <MobileBottomNav />`r`n    </>`r`n  );"
        
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            Write-Host "  ✓ Added Footer and MobileBottomNav components" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Could not find closing pattern, skipping" -ForegroundColor Yellow
            $skipCount++
            continue
        }
        
        # Save the file
        Set-Content $fullPath $content -NoNewline
        Write-Host "  ✅ Successfully updated!" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host "  ❌ ERROR: $_" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Successfully updated: $successCount files" -ForegroundColor Green
Write-Host "  ⚠️  Skipped: $skipCount files" -ForegroundColor Yellow
Write-Host "  ❌ Errors: $errorCount files" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
