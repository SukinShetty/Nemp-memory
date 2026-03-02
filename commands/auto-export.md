---
description: "Enable or disable automatic cross-provider memory export"
argument-hint: "[on|off|status|targets <list>]"
---

# /nemp-pro:auto-export

Toggle automatic cross-provider export on or off, or configure export targets.

## Usage
```
/nemp-pro:auto-export on                        # Enable auto-export
/nemp-pro:auto-export off                       # Disable auto-export
/nemp-pro:auto-export status                    # Check current status (default)
/nemp-pro:auto-export targets codex,cursor      # Set export targets
/nemp-pro:auto-export targets all               # Export to all providers
/nemp-pro:auto-export                           # Show status (same as status)
```

## Arguments
- `on`: Enable automatic export after every memory change
- `off`: Disable automatic export
- `status`: Show current auto-export status and targets (default if no argument)
- `targets <list>`: Set comma-separated export targets (`codex`, `cursor`, `windsurf`, `all`)

## Instructions

When the user invokes `/nemp-pro:auto-export`, follow these steps:

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
Auto-export ENABLED

What will be auto-exported:
  Targets: codex

After every /nemp:save, /nemp:init, or /nemp:forget, these files update automatically:
  - AGENTS.md (Codex CLI)

Run /nemp-pro:auto-export targets codex,cursor,windsurf to change targets.
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
Run /nemp-pro:export --all to update manually.
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
  /nemp-pro:auto-export on                    - Enable
  /nemp-pro:auto-export targets codex,cursor  - Set targets
  /nemp-pro:export --all                      - Export now
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

Run /nemp-pro:auto-export on to enable auto-export.
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
User: `/nemp-pro:auto-export on`

```
Auto-export ENABLED

What will be auto-exported:
  Targets: codex

After every /nemp:save, /nemp:init, or /nemp:forget, these files update automatically:
  - AGENTS.md (Codex CLI)

Run /nemp-pro:auto-export targets codex,cursor,windsurf to change targets.
```

### Disable auto-export
User: `/nemp-pro:auto-export off`

```
Auto-export DISABLED

Export files will NOT be updated automatically.
Run /nemp-pro:export --all to update manually.
```

### Check status
User: `/nemp-pro:auto-export status`

```
Auto-export Status

  Enabled: Yes
  Targets: codex, cursor
  Last export: 2026-03-01 14:23

Commands:
  /nemp-pro:auto-export on                    - Enable
  /nemp-pro:auto-export targets codex,cursor  - Set targets
  /nemp-pro:export --all                      - Export now
```

### Set targets to all providers
User: `/nemp-pro:auto-export targets all`

```
Auto-export targets updated

  Targets: codex, cursor, windsurf

Run /nemp-pro:auto-export on to enable auto-export.
```

### Set specific targets
User: `/nemp-pro:auto-export targets codex,windsurf`

```
Auto-export targets updated

  Targets: codex, windsurf

Run /nemp-pro:auto-export on to enable auto-export.
```

## Related Commands
- `/nemp-pro:export --all` - Export to all targets manually
- `/nemp-pro:export --codex` - Export to Codex (AGENTS.md) manually
- `/nemp-pro:export --cursor` - Export to Cursor manually
- `/nemp-pro:export --windsurf` - Export to Windsurf manually
- `/nemp-pro:auto-capture` - Toggle automatic activity capture
