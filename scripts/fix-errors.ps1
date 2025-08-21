# PowerShell script to fix TypeScript errors
Write-Host "Starting TypeScript error fix..." -ForegroundColor Cyan

# Phase 1: Remove all unused imports (TS6133)
Write-Host "`nPhase 1: Removing unused imports..." -ForegroundColor Yellow

Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|dist|build" } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false
    
    # Remove unused FC imports
    if ($content -match "import.*\bFC\b.*from 'react'" -and $content -notmatch ": FC[<\[]") {
        $content = $content -replace "\bFC\s*,\s*", ""
        $content = $content -replace ",\s*FC\b", ""
        $content = $content -replace "{\s*FC\s*}", "{}"
        $modified = $true
    }
    
    # Remove unused ReactNode imports
    if ($content -match "import.*\bReactNode\b.*from 'react'" -and $content -notmatch ": ReactNode") {
        $content = $content -replace "\bReactNode\s*,\s*", ""
        $content = $content -replace ",\s*ReactNode\b", ""
        $modified = $true
    }
    
    # Remove unused Link imports
    if ($content -match "import.*\bLink\b.*from 'react-router-dom'" -and $content -notmatch "<Link") {
        $content = $content -replace "\bLink\s*,\s*", ""
        $content = $content -replace ",\s*Link\b", ""
        $modified = $true
    }
    
    # Remove unused Navigate imports
    if ($content -match "import.*\bNavigate\b.*from 'react-router-dom'" -and $content -notmatch "<Navigate") {
        $content = $content -replace "\bNavigate\s*,\s*", ""
        $content = $content -replace ",\s*Navigate\b", ""
        $modified = $true
    }
    
    # Remove unused KeyboardEvent, MouseEvent, ChangeEvent imports
    @("KeyboardEvent", "MouseEvent", "ChangeEvent", "lazy", "memo") | ForEach-Object {
        $import = $_
        if ($content -match "import.*\b$import\b.*from 'react'" -and $content -notmatch ": $import") {
            $content = $content -replace "\b$import\s*,\s*", ""
            $content = $content -replace ",\s*$import\b", ""
            $modified = $true
        }
    }
    
    # Remove empty imports
    $content = $content -replace "import\s*{\s*}\s*from\s*['\"][^'\"]+['\"]\s*;?\s*\n", ""
    
    # Clean up formatting
    $content = $content -replace ",\s*}", " }"
    $content = $content -replace "{\s*,", "{ "
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# Phase 2: Add missing icon imports
Write-Host "`nPhase 2: Adding missing imports..." -ForegroundColor Yellow

$iconImports = @{
    "PaperAirplaneIcon" = "@heroicons/react/24/outline"
    "ChevronRightIcon" = "@heroicons/react/24/outline"
    "CalendarDaysIcon" = "@heroicons/react/24/outline"
    "ChartBarIcon" = "@heroicons/react/24/outline"
    "SignalSlashIcon" = "@heroicons/react/24/outline"
    "PlayIcon" = "@heroicons/react/24/outline"
    "XMarkIcon" = "@heroicons/react/24/outline"
    "CheckIcon" = "@heroicons/react/24/outline"
    "TrashIcon" = "@heroicons/react/24/outline"
    "VideoCameraIcon" = "@heroicons/react/24/outline"
    "EyeIcon" = "@heroicons/react/24/outline"
    "HeartIcon" = "@heroicons/react/24/outline"
    "StopIcon" = "@heroicons/react/24/outline"
    "MicrophoneIcon" = "@heroicons/react/24/outline"
    "ChatBubbleLeftIcon" = "@heroicons/react/24/outline"
    "Cog6ToothIcon" = "@heroicons/react/24/outline"
    "QueueListIcon" = "@heroicons/react/24/outline"
    "DocumentTextIcon" = "@heroicons/react/24/outline"
    "CurrencyDollarIcon" = "@heroicons/react/24/outline"
    "UserGroupIcon" = "@heroicons/react/24/outline"
    "PaintBrushIcon" = "@heroicons/react/24/outline"
    "FilmIcon" = "@heroicons/react/24/outline"
    "CogIcon" = "@heroicons/react/24/outline"
    "PlusIcon" = "@heroicons/react/24/outline"
    "ClockIcon" = "@heroicons/react/24/outline"
    "HandThumbUpIcon" = "@heroicons/react/24/outline"
    "ShareIcon" = "@heroicons/react/24/outline"
    "DevicePhoneMobileIcon" = "@heroicons/react/24/outline"
    "ComputerDesktopIcon" = "@heroicons/react/24/outline"
    "GlobeAltIcon" = "@heroicons/react/24/outline"
    "TvIcon" = "@heroicons/react/24/outline"
    "ArrowTrendingUpIcon" = "@heroicons/react/24/outline"
    "ArrowTrendingDownIcon" = "@heroicons/react/24/outline"
    "SparklesIcon" = "@heroicons/react/24/outline"
    "BugAntIcon" = "@heroicons/react/24/outline"
}

Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|dist|build" } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false
    $importsToAdd = @()
    
    foreach ($icon in $iconImports.Keys) {
        if ($content -match "<$icon\b" -and $content -notmatch "import.*$icon") {
            $importsToAdd += "import { $icon } from '$($iconImports[$icon])';"
            $modified = $true
        }
    }
    
    if ($importsToAdd.Count -gt 0) {
        $importBlock = ($importsToAdd -join "`n") + "`n"
        # Add after the last import
        if ($content -match "^import.*from.*;\s*$" -or $content -match "^import.*from.*'$") {
            $content = $content -replace "(import.*from.*[;'][\r\n]+)", "`$1$importBlock"
        } else {
            $content = $importBlock + $content
        }
        
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Added imports to: $($_.Name)" -ForegroundColor Green
    }
}

# Phase 3: Fix event handler types
Write-Host "`nPhase 3: Fixing event handler types..." -ForegroundColor Yellow

Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|dist|build" } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false
    
    # Fix addEventListener/removeEventListener
    if ($content -match "addEventListener\(['\"](\w+)['\"],\s*([^,)]+)(?!\s+as\s+EventListener)") {
        $content = $content -replace "addEventListener\((['\"])(\w+)\1,\s*([^,)]+)(?!\s+as\s+EventListener)", 'addEventListener($1$2$1, $3 as EventListener'
        $modified = $true
    }
    
    if ($content -match "removeEventListener\(['\"](\w+)['\"],\s*([^,)]+)(?!\s+as\s+EventListener)") {
        $content = $content -replace "removeEventListener\((['\"])(\w+)\1,\s*([^,)]+)(?!\s+as\s+EventListener)", 'removeEventListener($1$2$1, $3 as EventListener'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed event handlers in: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`nFix complete! Running type check..." -ForegroundColor Cyan
npm run type-check 2>&1 | Select-String "error TS" | Measure-Object | ForEach-Object { 
    Write-Host "Remaining errors: $($_.Count)" -ForegroundColor $(if ($_.Count -eq 0) { "Green" } else { "Yellow" })
}
