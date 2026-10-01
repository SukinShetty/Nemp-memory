---
description: "Experimental: Enable or disable automatic cross-provider memory export"
argument-hint: "[on|off|status|targets <list>]"
---

# /nemp:auto-export

> Experimental configuration only: this repository has not established an automatic trigger from save/init/forget to provider export. Saving an enabled flag must not be reported as a working auto-export integration. Run a prototype export explicitly when testing.

Toggle automatic cross-provider export on or off, or configure export targets.

## Usage
```
/nemp:auto-export on                        # Enable auto-export
/nemp:auto-export off                       # Disable auto-export
/nemp:auto-export status                    # Check current status (default)
/nemp:auto-export targets codex,cursor      # Set export targets
/nemp:auto-export targets all               # Export to all providers
/nemp:auto-export                           # Show status (same as status)
```

## Arguments
- `on`: Save the experimental auto-export preference; automatic hook execution requires validation
- `off`: Disable automatic export
- `status`: Show current auto-export status and targets (default if no argument)
- `targets <list>`: Set comma-separated export targets (`codex`, `cursor`, `windsurf`, `all`)

## Instructions

When the user invokes `/nemp:auto-export`, follow these steps:

### 1. Parse Argument

Extract the action: `on`, `off`, `status`, or `targets` (default to `status` if empty).

For `targets`, also extract the comma-separated target list from the remainder of the argument.

### 2. Configuration File Location

Auto-export config is stored in: `.nemp-pro/config.json`

The `autoExport` section:
```json
{
  "autoExport": {
    "enabled": false,
    "targets": ["codex"],
    "lastExport": null
  }
}
```

### 3. Handle Actions

**For `on`:**
```bash
mkdir -p .nemp-pro
```

Read or create `.nemp-pro/config.json`, set `autoExport.enabled = true`, write back.

Read `autoExport.targets` from config to include in confirmation (default: `["codex"]`).

Confirm:
```
Auto-export preference saved (experimental)

What will be auto-exported:
  Targets: codex

Configured target files (automatic hook execution is unverified in this build):
  - AGENTS.md (Codex CLI)

Run /nemp:auto-export targets codex,cursor,windsurf to change targets.
```

Adjust the file list shown based on actual configured targets:
- `codex` -> `AGENTS.md (Codex CLI)`
- `cursor` -> `.cursor/rules/nemp-memory.mdc (Cursor)`
- `windsurf` -> `.windsurfrules (Windsurf)`

**For `off`:**
Read `.nemp-pro/config.json`, set `autoExport.enabled = false`, write back.

Confirm:
```
Auto-export DISABLED

Export files will NOT be updated automatically.
Run /nemp:nemp-pro-export --all to update manually.
```

**For `status` (default):**
Read `.nemp-pro/config.json` and display current state.

Format `lastExport` as `YYYY-MM-DD HH:MM` if set, otherwise show `Never`.

Format `targets` as a comma-separated list.

```
Auto-export Status

  Enabled: Yes/No
  Targets: codex, cursor
  Last export: 2026-03-01 14:23 (or "Never")

Commands:
  /nemp:auto-export on                    - Enable
  /nemp:auto-export targets codex,cursor  - Set targets
  /nemp:nemp-pro-export --all                      - Export now
```

**For `targets <list>`:**
Parse the comma-separated list. Valid values: `codex`, `cursor`, `windsurf`, `all`.

If `all` is present anywhere in the list, expand targets to `["codex", "cursor", "windsurf"]`.

Otherwise, build the targets array from the valid values provided (ignore unknown values).

Read or create `.nemp-pro/config.json`, update `autoExport.targets`, write back.

Confirm:
```
Auto-export targets updated

  Targets: codex, cursor, windsurf

Run /nemp:auto-export on to enable auto-export.
```

### 4. Initialize Config (if not exists)

If `.nemp-pro/config.json` doesn't exist, create it with full defaults:

```json
{
  "version": "1.0",
  "autoCapture": {
    "enabled": false,
    "tools": ["Edit", "Write", "Bash"],
    "capturePatterns": {
      "Edit": "file modifications",
      "Write": "new files created",
      "Bash": "git commits, npm/bun commands"
    },
    "excludePaths": ["node_modules/**", ".git/**", "*.log", ".nemp-pro/**"]
  },
  "autoExport": {
    "enabled": false,
    "targets": ["codex"],
    "lastExport": null
  }
}
```

If the file exists but lacks an `autoExport` key, add it with the defaults above (preserve existing keys).

### 5. Read/Write Config

Use the Read tool to check for existing config, then Write tool to update it.

## Example Interactions

### Enable auto-export
User: `/nemp:auto-export on`

```
Auto-export preference saved (experimental)

What will be auto-exported:
  Targets: codex

Configured target files (automatic hook execution is unverified in this build):
  - AGENTS.md (Codex CLI)

Run /nemp:auto-export targets codex,cursor,windsurf to change targets.
```

### Disable auto-export
User: `/nemp:auto-export off`

```
Auto-export DISABLED

Export files will NOT be updated automatically.
Run /nemp:nemp-pro-export --all to update manually.
```

### Check status
User: `/nemp:auto-export status`

```
Auto-export Status

  Enabled: Yes
  Targets: codex, cursor
  Last export: 2026-03-01 14:23

Commands:
  /nemp:auto-export on                    - Enable
  /nemp:auto-export targets codex,cursor  - Set targets
  /nemp:nemp-pro-export --all                      - Export now
```

### Set targets to all providers
User: `/nemp:auto-export targets all`

```
Auto-export targets updated

  Targets: codex, cursor, windsurf

Run /nemp:auto-export on to enable auto-export.
```

### Set specific targets
User: `/nemp:auto-export targets codex,windsurf`

```
Auto-export targets updated

  Targets: codex, windsurf

Run /nemp:auto-export on to enable auto-export.
```

## Related Commands
- `/nemp:nemp-pro-export --all` - Export to all targets manually
- `/nemp:nemp-pro-export --codex` - Export to Codex (AGENTS.md) manually
- `/nemp:nemp-pro-export --cursor` - Export to Cursor manually
- `/nemp:nemp-pro-export --windsurf` - Export to Windsurf manually
- `/nemp:auto-capture` - Toggle automatic activity capture
