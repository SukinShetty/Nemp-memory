---
description: "Experimental: Enable or disable automatic activity capture"
argument-hint: "[on|off|status]"
---

# /nemp:auto-capture

> Experimental: this command configures capture in `.nemp-pro/`, a legacy local path. Hook registration and execution are not verified in this build. A saved enabled flag does not prove that activity is being captured.

Toggle automatic activity capture on or off.

## Usage
```
/nemp:auto-capture on      # Enable auto-capture
/nemp:auto-capture off     # Disable auto-capture
/nemp:auto-capture status  # Check current status
/nemp:auto-capture         # Show status (same as status)
```

## Arguments
- `on`: Enable automatic activity capture for this project
- `off`: Disable automatic activity capture
- `status`: Show current auto-capture status (default if no argument)

## Instructions

When the user invokes `/nemp:auto-capture`, follow these steps:

### 1. Parse Argument
Extract the action: `on`, `off`, or `status` (default to `status` if empty).

### 2. Configuration File Location
Auto-capture config is stored in: `.nemp-pro/config.json`

```json
{
  "autoCapture": {
    "enabled": true,
    "tools": ["Edit", "Write", "Bash"],
    "capturePatterns": {
      "Edit": "file modifications",
      "Write": "new files created",
      "Bash": "git commits, npm/bun commands"
    }
  }
}
```

### 3. Handle Actions

**For `on`:**
```bash
mkdir -p .nemp-pro
```

Read or create `.nemp-pro/config.json`, set `autoCapture.enabled = true`, write back.

Confirm:
```
Auto-capture preference enabled (experimental)

Configured capture targets (verify the hook before relying on capture):
  - Edit: File modifications
  - Write: New files created
  - Bash: Git commits, npm/bun commands

Activities saved to: .nemp-pro/activity.log
Review with: /nemp:activity
```

**For `off`:**
Read `.nemp-pro/config.json`, set `autoCapture.enabled = false`, write back.

Confirm:
```
Auto-capture DISABLED

No automatic activity capture will occur.
```

**For `status`:**
Read `.nemp-pro/config.json` and display current state:

```
Auto-capture Status

  Enabled: Yes/No
  Tools monitored: Edit, Write, Bash
  Activity log: .nemp-pro/activity.log
  Entries captured: N

Commands:
  /nemp:auto-capture on   - Enable
  /nemp:auto-capture off  - Disable
  /nemp:activity          - View captured activities
```

### 4. Initialize Config (if not exists)

If `.nemp-pro/config.json` doesn't exist, create it:

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
    "excludePaths": [
      "node_modules/**",
      ".git/**",
      "*.log",
      ".nemp-pro/**"
    ]
  }
}
```

### 5. Read/Write Config

Use the Read tool to check for existing config, then Write tool to update it.

## Example Interactions

### Enable auto-capture
User: `/nemp:auto-capture on`

```
Auto-capture preference enabled (experimental)

Configured capture targets (verify the hook before relying on capture):
  - Edit: File modifications
  - Write: New files created
  - Bash: Git commits, npm/bun commands

Activities saved to: .nemp-pro/activity.log
Review captured activities: /nemp:activity
```

### Disable auto-capture
User: `/nemp:auto-capture off`

```
Auto-capture DISABLED

No automatic activity capture will occur.
```

### Check status
User: `/nemp:auto-capture status`

```
Auto-capture Status

  Enabled: Yes
  Tools: Edit, Write, Bash
  Log: .nemp-pro/activity.log (12 entries)

Commands:
  /nemp:auto-capture off  - Disable
  /nemp:activity          - View log
```

## Related Commands
- `/nemp:activity` - View captured activity log
- `/nemp:activity --clear` - Clear activity log
