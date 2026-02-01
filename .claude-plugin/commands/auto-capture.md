---
description: "Enable or disable automatic activity capture"
argument-hint: "[on|off|status]"
---

# /nemp-pro:auto-capture

Toggle automatic activity capture on or off.

## Usage
```
/nemp-pro:auto-capture on      # Enable auto-capture
/nemp-pro:auto-capture off     # Disable auto-capture
/nemp-pro:auto-capture status  # Check current status
/nemp-pro:auto-capture         # Show status (same as status)
```

## Arguments
- `on`: Enable automatic activity capture for this project
- `off`: Disable automatic activity capture
- `status`: Show current auto-capture status (default if no argument)

## Instructions

When the user invokes `/nemp-pro:auto-capture`, follow these steps:

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
Auto-capture ENABLED

What will be captured:
  - Edit: File modifications
  - Write: New files created
  - Bash: Git commits, npm/bun commands

Activities saved to: .nemp-pro/activity.log
Review with: /nemp-pro:activity
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
  /nemp-pro:auto-capture on   - Enable
  /nemp-pro:auto-capture off  - Disable
  /nemp-pro:activity          - View captured activities
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
User: `/nemp-pro:auto-capture on`

```
Auto-capture ENABLED

What will be captured:
  - Edit: File modifications
  - Write: New files created
  - Bash: Git commits, npm/bun commands

Activities saved to: .nemp-pro/activity.log
Review captured activities: /nemp-pro:activity
```

### Disable auto-capture
User: `/nemp-pro:auto-capture off`

```
Auto-capture DISABLED

No automatic activity capture will occur.
```

### Check status
User: `/nemp-pro:auto-capture status`

```
Auto-capture Status

  Enabled: Yes
  Tools: Edit, Write, Bash
  Log: .nemp-pro/activity.log (12 entries)

Commands:
  /nemp-pro:auto-capture off  - Disable
  /nemp-pro:activity          - View log
```

## Related Commands
- `/nemp-pro:activity` - View captured activity log
- `/nemp-pro:clear` - Clear activity log
