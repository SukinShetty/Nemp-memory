---
description: "View captured activity log"
argument-hint: "[--clear|--stats]"
---

# /nemp-pro:activity

View or manage the captured activity log.

## Usage
```
/nemp-pro:activity          # View recent activities
/nemp-pro:activity --clear  # Clear the activity log
/nemp-pro:activity --stats  # Show activity statistics
```

## Instructions

### 1. Read Activity Log

Read `.nemp-pro/activity.log` file. If it doesn't exist, inform user that no activities have been captured yet.

### 2. Handle Arguments

**Default (no argument):**
Display the activity log in a readable format:

```
Activity Log (12 entries)

Recent Activities:
  2026-01-30 15:45 | Bash   | git commit -m 'Add auth'
  2026-01-30 15:40 | Edit   | src/middleware/auth.ts (modified)
  2026-01-30 15:35 | Write  | src/auth/refresh.ts (created)
  2026-01-30 15:32 | Bash   | npm test
  2026-01-30 15:30 | Edit   | src/auth/login.ts (modified)

Showing last 20 entries. Total: 12
```

**For `--clear`:**
Ask for confirmation using AskUserQuestion, then delete `.nemp-pro/activity.log` if confirmed.

```
Activity log cleared. 12 entries removed.
```

**For `--stats`:**
Analyze the activity log and show statistics:

```
Activity Statistics

Total entries: 45
Time range: 2026-01-28 to 2026-01-30

By Tool:
  Edit:  28 (62%)
  Write:  8 (18%)
  Bash:   9 (20%)

Most Modified Files:
  1. src/auth/login.ts (7 times)
  2. src/middleware/auth.ts (5 times)
  3. src/utils/token.ts (4 times)

Common Commands:
  1. git commit (5 times)
  2. npm test (3 times)
  3. npm install (1 time)
```

### 3. Empty State

If no activity log exists or is empty:

```
No activities captured yet.

Enable auto-capture: /nemp-pro:auto-capture on
```

## Related Commands
- `/nemp-pro:auto-capture` - Toggle auto-capture on/off
