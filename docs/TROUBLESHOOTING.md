# Troubleshooting

Fixes for the most common install and loading problems. If none of these help, [open an issue](https://github.com/SukinShetty/Nemp-memory/issues).

## Commands not working?

**Step 1: Restart Claude Code**
```bash
exit
claude
```

**Step 2: Verify installation**
```bash
/plugin list
# Should show: nemp@nemp-memory
```

**Step 3: Clean reinstall**
```bash
/plugin uninstall nemp
/plugin marketplace remove nemp-memory
exit
claude
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
exit
claude
```

## Windows Permission Error (EPERM)

If you see an error like:
```
Error: EPERM: operation not permitted, open 'C:\Users\...'
```

**What's happening:** Windows is blocking file access, often due to antivirus or file locks.

**Fix it:**

**Step 1:** Close any programs that might have the file open (VS Code, File Explorer)

**Step 2:** Run Claude Code as Administrator
- Right-click on your terminal (PowerShell/CMD)
- Select "Run as administrator"
- Try the command again

**Step 3:** If still failing, check Windows Defender
- Open Windows Security → Virus & threat protection
- Click "Manage settings" under Virus & threat protection settings
- Add your project folder to exclusions (scroll to "Exclusions")

**Step 4:** Verify it worked
```bash
/nemp:list
# Should show your memories without errors
```

---

## Commands Not Recognized

If you type `/nemp:save` and nothing happens, or you see:
```
Unknown command: nemp:save
```

**What's happening:** The plugin isn't loaded or registered properly.

**Fix it:**

**Step 1:** Check if the plugin is installed
```bash
/plugin list
```
You should see `nemp` in the list. If not, continue to Step 2.

**Step 2:** Reinstall the plugin
```bash
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
```

**Step 3:** Restart Claude Code (required!)
```bash
exit
claude
```

**Step 4:** Verify commands are available
```bash
/nemp:list
# Should work now
```

**Still not working?** Try a clean reinstall:
```bash
/plugin uninstall nemp
/plugin marketplace remove nemp-memory
exit
claude
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
exit
claude
```

---

## Marketplace Clone Failures

If you see errors like:
```
Error: Failed to clone marketplace repository
fatal: could not read from remote repository
```
or
```
Error: Repository not found
```

**What's happening:** Git can't access the GitHub repository.

**Fix it:**

**Step 1:** Check your internet connection
```bash
ping github.com
```

**Step 2:** Verify Git is installed
```bash
git --version
# Should show: git version 2.x.x
```

If Git isn't installed, download it from [git-scm.com](https://git-scm.com/downloads)

**Step 3:** Try cloning manually to test access
```bash
git clone https://github.com/SukinShetty/Nemp-memory.git ~/test-nemp
```

If this fails, you may have:
- Firewall blocking GitHub
- Corporate proxy issues
- GitHub rate limiting

**Step 4:** For corporate networks/proxies, configure Git
```bash
git config --global http.proxy http://your-proxy:port
```

**Step 5:** Once Git works, retry installation
```bash
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
exit
claude
```

---

## Plugin Not Loading

If the plugin appears installed but commands don't work:
```bash
/plugin list
# Shows: nemp@nemp-memory ✓

/nemp:list
# But this does nothing or shows error
```

**What's happening:** The plugin files exist but aren't being loaded by Claude Code.

**Fix it:**

**Step 1:** Clear the plugin cache
```bash
# On Mac/Linux:
rm -rf ~/.claude/plugins/cache/nemp*

# On Windows (PowerShell):
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\plugins\cache\nemp*"
```

**Step 2:** Restart Claude Code
```bash
exit
claude
```

**Step 3:** If still not working, check for corrupted installation
```bash
/plugin uninstall nemp
/plugin marketplace remove nemp-memory
```

**Step 4:** Clear all plugin data and reinstall fresh
```bash
# On Mac/Linux:
rm -rf ~/.claude/plugins/nemp*
rm -rf ~/.claude/marketplace/nemp*

# On Windows (PowerShell):
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\plugins\nemp*"
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\marketplace\nemp*"
```

**Step 5:** Restart and reinstall
```bash
exit
claude
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
exit
claude
```

**Step 6:** Verify everything works
```bash
/plugin list
# Should show: nemp@nemp-memory

/nemp:list
# Should show your memories (or empty list if new install)
```

---

## Uninstalling Nemp

**Remove plugin:**
```bash
/plugin uninstall nemp
/plugin marketplace remove nemp-memory
```

**Delete all data (optional):**
```bash
# Delete project memories
rm -rf .nemp

# Delete global memories
rm -rf ~/.nemp
```

**Note:** Deleting `.nemp` folders removes ALL saved memories permanently.

## Still having issues?

1. Check Claude Code version (requires v2.0+)
2. Clear cache: `rm -rf ~/.claude/plugins/cache/nemp*`
3. [Open an issue on GitHub](https://github.com/SukinShetty/Nemp-memory/issues)
