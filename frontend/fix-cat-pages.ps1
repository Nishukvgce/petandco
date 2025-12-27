$files = @(
    "src/pages/shop-for-cats/CatBedding.jsx",
    "src/pages/shop-for-cats/CatBowls.jsx",
    "src/pages/shop-for-cats/CatCollars.jsx",
    "src/pages/shop-for-cats/CatLitter.jsx",
    "src/pages/shop-for-cats/CatToys.jsx",
    "src/pages/shop-for-cats/CatTreats.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Add imports if missing
        if (-not ($content -match "import Footer")) {
            $content = $content -replace "import Header from '../../components/ui/Header';", "import Header from '../../components/ui/Header';`r`nimport Footer from '../homepage/components/Footer';`r`nimport MobileBottomNav from '../../components/ui/MobileBottomNav';"
        }
        
        # Add components if missing
        if (-not ($content -match "<Footer />")) {
            # Replace the closing fragment </ > with the components included
            # We use a regex that matches the LAST occurrence of </>
            # PowerShell -replace operator replaces ALL occurrences.
            # But usually there is only one main closing fragment for the page.
            # However, to be safe, we can try to match the one at the end of the return statement.
            
            $content = $content -replace "</>\s*\);\s*};", "`r`n    {/* Footer */}`r`n    <Footer />`r`n`r`n    {/* Mobile Bottom Navigation */}`r`n    <MobileBottomNav />`r`n    </>`r`n  );`r`n};"
        }
        
        Set-Content $file $content -NoNewline
        Write-Host "Updated $file"
    }
}
