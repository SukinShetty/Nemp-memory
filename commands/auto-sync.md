---
description: "Enable or disable automatic syncing to CLAUDE.md"
argument-hint: "[on|off|status]"
---

# /nemp:auto-sync

Toggle automatic syncing of memories to CLAUDE.md.

## Usage
```
/nemp:auto-sync on      # Enable auto-sync
/nemp:auto-sync off     # Disable auto-sync
/nemp:auto-sync status  # Check current status
/nemp:auto-sync         # Show status (same as status)
```

## Arguments
- `on`: Enable automatic syncing to CLAUDE.md after memory changes
- `off`: Disable automatic syncing
- `status`: Show current auto-sync status (default if no argument)

## Instructions

When the user invokes `/nemp:auto-sync`, follow these steps:

### 1. Parse Argument
Extract the action: `on`, `off`, or `status` (default to `status` if empty).

### 2. Configuration File Location
Auto-sync config is stored in: `.nemp/config.json`

```json
{
  "autoSync": true
}
```

### 3. Handle Actions

**For `on`:**
```bash
mkdir -p .nemp
```

Read or create `.nemp/config.json`, set `autoSync = true`, write back.

Confirm:
```
Auto-sync ENABLED

What happens now:
  - /nemp:save   -> CLAUDE.md updates automatically
  - /nemp:init   -> CLAUDE.md updates automatically
  - /nemp:forget -> CLAUDE.md updates automatically

CLAUDE.md will always stay in sync with your memories.
```

**For `off`:**
Read `.nemp/config.json`, set `autoSync = false`, write back.

Confirm:
```
Auto-sync DISABLED

CLAUDE.md will not update automatically.
Run these manually when needed:
  - /nemp:export  (write memories to CLAUDE.md)
  - /nemp:sync    (two-way sync)
```

**For `status`:**
Read `.nemp/config.json` and display current state:

```
Auto-sync Status

  Enabled: Yes/No
  Config: .nemp/config.json

When enabled, these commands update CLAUDE.md:
  - /nemp:save
  - /nemp:init
  - /nemp:forget

Commands:
  /nemp:auto-sync on   - Enable
  /nemp:auto-sync off  - Disable
```

### 4. Initialize Config (if not exists)

If `.nemp/config.json` doesn't exist, create it:

```json
{
  "autoSync": false
}
```

### 5. Read/Write Config

Use the Read tool to check for existing config, then Write tool to update it.

**Reading config:**
```bash
[ -f ".nemp/config.json" ] && cat .nemp/config.json
```

**Merging config:**
When updating, preserve any existing keys (like `autoCapture`) and only update `autoSync`.

## Example Interactions

### Enable auto-sync
User: `/nemp:auto-sync on`

```
Auto-sync ENABLED

What happens now:
  - /nemp:save   -> CLAUDE.md updates automatically
  - /nemp:init   -> CLAUDE.md updates automatically
  - /nemp:forget -> CLAUDE.md updates automatically

CLAUDE.md will always stay in sync with your memories.
```

### Disable auto-sync
User: `/nemp:auto-sync off`

```
Auto-sync DISABLED

CLAUDE.md will not update automatically.
Run these manually when needed:
  - /nemp:export  (write memories to CLAUDE.md)
  - /nemp:sync    (two-way sync)
```

### Check status
User: `/nemp:auto-sync status`

```
Auto-sync Status

  Enabled: Yes
  Config: .nemp/config.json

When enabled, these commands update CLAUDE.md:
  - /nemp:save
  - /nemp:init
  - /nemp:forget

Commands:
  /nemp:auto-sync off  - Disable
```

## Related Commands
- `/nemp:export` - Manually export memories to CLAUDE.md
- `/nemp:sync` - Two-way sync between memories and CLAUDE.md
- `/nemp:save` - Save a memory (triggers auto-sync if enabled)
- `/nemp:init` - Initialize project (triggers auto-sync if enabled)
- `/nemp:forget` - Delete a memory (triggers auto-sync if enabled)
