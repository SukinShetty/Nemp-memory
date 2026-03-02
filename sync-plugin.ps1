# Nemp Memory Plugin Sync Script
# Syncs development files to BOTH Claude Code marketplace and cache folders

$SourceCommands = "C:\Users\SukinShetty\Nemp-memory\commands"
$SourceHooks = "C:\Users\SukinShetty\Nemp-memory\.claude-plugin\hooks"
$SourcePluginJson = "C:\Users\SukinShetty\Nemp-memory\.claude-plugin\plugin.json"

# Destination folders
$MarketplaceCommands = "C:\Users\SukinShetty\.claude\plugins\marketplaces\nemp-memory\commands"
$MarketplaceHooks = "C:\Users\SukinShetty\.claude\plugins\marketplaces\nemp-memory\.claude-plugin\hooks"
$MarketplacePlugin = "C:\Users\SukinShetty\.claude\plugins\marketplaces\nemp-memory\.claude-plugin\plugin.json"
$CacheCommands = "C:\Users\SukinShetty\.claude\plugins\cache\nemp-memory\nemp\0.3.0\commands"
$CacheHooks = "C:\Users\SukinShetty\.claude\plugins\cache\nemp-memory\nemp\0.3.0\.claude-plugin\hooks"
$CachePlugin = "C:\Users\SukinShetty\.claude\plugins\cache\nemp-memory\nemp\0.3.0\.claude-plugin\plugin.json"

Write-Host "=== Nemp Memory Plugin Sync ===" -ForegroundColor Cyan
Write-Host ""

# Ensure all destination directories exist before copying
$allDirs = @($MarketplaceCommands, $MarketplaceHooks, (Split-Path $MarketplacePlugin))
foreach ($dir in $allDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

# Sync commands folder
Write-Host "Syncing commands..." -ForegroundColor Yellow
$commandFiles = Get-ChildItem -Path $SourceCommands -File
foreach ($file in $commandFiles) {
    Copy-Item -Path $file.FullName -Destination $MarketplaceCommands -Force
    Copy-Item -Path $file.FullName -Destination $CacheCommands -Force
    Write-Host "  Copied: $($file.Name)" -ForegroundColor Green
}
Write-Host "Commands synced: $($commandFiles.Count) files to marketplace + cache" -ForegroundColor Cyan
Write-Host ""

# Sync hooks folder
Write-Host "Syncing hooks..." -ForegroundColor Yellow
if (Test-Path $SourceHooks) {
    $hookFiles = Get-ChildItem -Path $SourceHooks -File
    foreach ($file in $hookFiles) {
        Copy-Item -Path $file.FullName -Destination $MarketplaceHooks -Force
        Copy-Item -Path $file.FullName -Destination $CacheHooks -Force
        Write-Host "  Copied: $($file.Name)" -ForegroundColor Green
    }
    Write-Host "Hooks synced: $($hookFiles.Count) files to marketplace + cache" -ForegroundColor Cyan
} else {
    Write-Host "  No hooks folder found at source" -ForegroundColor Gray
}

Write-Host ""
# Sync plugin.json
Write-Host "Syncing plugin.json..." -ForegroundColor Yellow
Copy-Item -Path $SourcePluginJson -Destination $MarketplacePlugin -Force
Copy-Item -Path $SourcePluginJson -Destination $CachePlugin -Force
Write-Host "  Copied: plugin.json to marketplace + cache" -ForegroundColor Green
Write-Host ""

Write-Host "=== Sync Complete ===" -ForegroundColor Cyan
Write-Host "  Marketplace: ~/.claude/plugins/marketplaces/nemp-memory/" -ForegroundColor Gray
Write-Host "  Cache: ~/.claude/plugins/cache/nemp-memory/nemp/0.3.0/" -ForegroundColor Gray
