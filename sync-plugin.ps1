# Nemp Memory Plugin Sync Script
# Syncs development files to the Claude Code marketplace folder

$SourceCommands = "C:\Users\SukinShetty\Nemp-memory\commands"
$DestCommands = "C:\Users\SukinShetty\.claude\plugins\marketplaces\nemp-memory\commands"
$SourceHooks = "C:\Users\SukinShetty\Nemp-memory\.claude-plugin\hooks"
$DestHooks = "C:\Users\SukinShetty\.claude\plugins\marketplaces\nemp-memory\.claude-plugin\hooks"

Write-Host "=== Nemp Memory Plugin Sync ===" -ForegroundColor Cyan
Write-Host ""

# Sync commands folder
Write-Host "Syncing commands..." -ForegroundColor Yellow
$commandFiles = Get-ChildItem -Path $SourceCommands -File
foreach ($file in $commandFiles) {
    Copy-Item -Path $file.FullName -Destination $DestCommands -Force
    Write-Host "  Copied: $($file.Name)" -ForegroundColor Green
}
Write-Host "Commands synced: $($commandFiles.Count) files" -ForegroundColor Cyan
Write-Host ""

# Sync hooks folder
Write-Host "Syncing hooks..." -ForegroundColor Yellow
if (Test-Path $SourceHooks) {
    $hookFiles = Get-ChildItem -Path $SourceHooks -File
    foreach ($file in $hookFiles) {
        Copy-Item -Path $file.FullName -Destination $DestHooks -Force
        Write-Host "  Copied: $($file.Name)" -ForegroundColor Green
    }
    Write-Host "Hooks synced: $($hookFiles.Count) files" -ForegroundColor Cyan
} else {
    Write-Host "  No hooks folder found at source" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Sync Complete ===" -ForegroundColor Cyan
