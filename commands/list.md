---
description: "List all saved memory keys"
argument-hint: "[--global|--project|--all]"
---

# /nemp:list

List all saved memory keys.

## Usage
```
/nemp:list
/nemp:list --global     # Show only global memories
/nemp:list --project    # Show only project memories
/nemp:list --all        # Show both (default)
```

## Instructions

When the user invokes `/nemp:list`, follow these steps:

### 1. Load Memories from Both Locations

```bash
# Check and read project memories
[ -f ".nemp/memories.json" ] && cat .nemp/memories.json

# Check and read global memories
[ -f "$HOME/.nemp/memories.json" ] && cat $HOME/.nemp/memories.json
```

### 2. Format Output

Group memories by source and display in a clean table format:

```
📚 Nemp Memory Index

── Project Memories (.nemp/memories.json) ──────────────────
  KEY                     UPDATED          PREVIEW
  auth-flow               2024-01-20       Authentication uses JWT...
  db-connection-string    2024-01-18       PostgreSQL on localhost...
  user-prefers-bun        2024-01-15       User prefers Bun over npm...

  Total: 3 memories

── Global Memories (~/.nemp/memories.json) ──────────────────
  KEY                     UPDATED          PREVIEW
  preferred-editor        2024-01-10       VS Code with Vim keybindings
  git-workflow            2024-01-08       Always rebase, never merge...

  Total: 2 memories

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 5 memories across all sources
```

### 3. Empty State

If no memories exist:
```
📚 Nemp Memory Index

No memories saved yet.

Get started:
  /nemp:save <key> <value>  - Save your first memory

Examples:
  /nemp:save user-prefers-typescript User prefers TypeScript over JavaScript
  /nemp:save project-uses-nextjs This project uses Next.js 14 with App Router
```

### 4. Sorting

Default sort: by `updated` date (most recent first)

## Output Fields
- **KEY**: The memory identifier
- **UPDATED**: Last modified date (relative or absolute)
- **PREVIEW**: First 40 characters of the value

## Tips to Show User
After listing, remind user:
- Use `/nemp:recall <key>` to see full memory content
- Use `/nemp:forget <key>` to delete a memory
- Use `/nemp:save <key> <new-value>` to update an existing memory
- Use `/nemp:list-global` to see only global memories
- Use `/nemp:save-global` to save memories that work across all projects
