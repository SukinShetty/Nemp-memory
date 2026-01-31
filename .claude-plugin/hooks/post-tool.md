# Post Tool Use Hook: Auto-Capture

This hook fires after tool uses to automatically capture activities. **Controlled by auto-capture setting.**

## Trigger
- Event: `PostToolUse`
- Filter: Only for `Edit`, `Write`, `Bash` tools
- Timing: Immediately after tool execution completes
- Condition: **Only runs if auto-capture is enabled in `.nemp-pro/config.json`**

## Instructions

When this hook fires after a tool use, follow these steps:

### 1. Check Auto-Capture Status

First, check if auto-capture is enabled by reading `.nemp-pro/config.json`.

**If the file doesn't exist or `autoCapture.enabled` is `false`, STOP HERE. Do nothing.**

### 2. Analyze Tool Action (if enabled)

Capture metadata about what happened based on the tool:

**For Edit:**
```json
{
  "tool": "Edit",
  "file": "<file-path-that-was-edited>",
  "action": "modified",
  "timestamp": "<ISO-8601-timestamp>"
}
```

**For Write:**
```json
{
  "tool": "Write",
  "file": "<file-path-that-was-created>",
  "action": "created",
  "timestamp": "<ISO-8601-timestamp>"
}
```

**For Bash:**
Only capture significant commands (git, npm, bun, build, test, deploy):
```json
{
  "tool": "Bash",
  "command": "<command-category>",
  "details": "<brief-description>",
  "timestamp": "<ISO-8601-timestamp>"
}
```

Skip capturing for:
- `ls`, `cat`, `pwd`, `cd` (navigation)
- `echo`, `mkdir` in `.nemp-pro/` (internal operations)
- Any command that reads `.nemp-pro/` files

### 3. Append to Activity Log

Read existing activity log from `.nemp-pro/activity.log`, parse as JSON array.
If file doesn't exist, start with empty array `[]`.

Append the new entry to the array and write back to `.nemp-pro/activity.log`.

**Activity Log Format:**
```json
[
  {
    "timestamp": "2026-01-30T15:30:00Z",
    "tool": "Edit",
    "file": "src/auth/login.ts",
    "action": "modified"
  },
  {
    "timestamp": "2026-01-30T15:32:00Z",
    "tool": "Bash",
    "command": "git",
    "details": "committed changes"
  }
]
```

### 4. Silent Operation

**IMPORTANT:** This hook should operate silently. Do NOT output anything to the user unless there's an error. The capture happens in the background.

### 5. Exclusion Rules

Do NOT capture activities for:
- Files in `node_modules/**`
- Files in `.git/**`
- Files in `.nemp-pro/**` (to avoid infinite loops)
- Log files (`*.log`)
- Lock files (`package-lock.json`, `bun.lockb`, etc.)

## Configuration

Auto-capture is controlled by `.nemp-pro/config.json`:

```json
{
  "version": "1.0",
  "autoCapture": {
    "enabled": true,
    "tools": ["Edit", "Write", "Bash"],
    "excludePaths": [
      "node_modules/**",
      ".git/**",
      "*.log",
      ".nemp-pro/**"
    ]
  }
}
```

## Toggle Auto-Capture

Users control auto-capture with:
- `/nemp-pro:auto-capture on` - Enable
- `/nemp-pro:auto-capture off` - Disable
- `/nemp-pro:auto-capture status` - Check status

## Example Activity Log Output

After a coding session with auto-capture enabled:

```json
[
  {"timestamp": "2026-01-30T15:30:00Z", "tool": "Edit", "file": "src/auth/login.ts", "action": "modified"},
  {"timestamp": "2026-01-30T15:32:00Z", "tool": "Bash", "command": "npm", "details": "npm test"},
  {"timestamp": "2026-01-30T15:35:00Z", "tool": "Write", "file": "src/auth/refresh.ts", "action": "created"},
  {"timestamp": "2026-01-30T15:40:00Z", "tool": "Edit", "file": "src/middleware/auth.ts", "action": "modified"},
  {"timestamp": "2026-01-30T15:45:00Z", "tool": "Bash", "command": "git", "details": "git commit -m 'Add auth'"}
]
```

## Pattern Analysis (Future Enhancement)

At session end, the activity log can be analyzed for patterns:
- Files edited 3+ times -> important files
- Repeated commands -> workflow patterns
- Consistent choices -> preferences

These insights can be promoted to permanent memories with user confirmation.
