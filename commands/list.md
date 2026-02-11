---
description: "List all saved memory keys"
argument-hint: "[--global|--project|--all]"
---

# /nemp:list

List all saved memory keys.

## Usage
/nemp:list
/nemp:list --global     # Show only global memories
/nemp:list --project    # Show only project memories
/nemp:list --all        # Show both (default)

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

Group memories by source and display with agent tracking:
📚 Nemp Memory Index
── Project Memories (.nemp/memories.json) ──────────────────
KEY                     AGENT          UPDATED          PREVIEW
auth-flow               nemp-init      2026-02-11       NextAuth.js with JWT...
db-config               backend        2026-02-11       PostgreSQL via Prisma...
api-design              main           2026-02-10       RESTful, versioned...
Total: 3 memories
── Global Memories (~/.nemp/memories.json) ──────────────────
KEY                     AGENT          UPDATED          PREVIEW
preferred-editor        main           2026-02-08       VS Code with Vim...
Total: 1 memory
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 4 memories across all sources

### 3. Update MEMORY.md Index

**After listing, regenerate `.nemp/MEMORY.md` to keep the index current.**
```markdown
# Nemp Memory Index

> Auto-generated. Last updated: [YYYY-MM-DD HH:MM]

## Stored Memories

| Key | Preview | Agent | Updated |
|-----|---------|-------|---------|
| auth-flow | NextAuth.js with JWT... | nemp-init | 2026-02-11 |
| db-config | PostgreSQL via Prisma... | backend | 2026-02-11 |

## Files

| File | Purpose |
|------|---------|
| `memories.json` | All stored memories |
| `access.log` | Read/write audit trail |
| `config.json` | Plugin configuration |
| `MEMORY.md` | This index file |
```

### 4. Empty State

If no memories exist:
📚 Nemp Memory Index
No memories saved yet.
Get started:
/nemp:save <key> <value>  - Save your first memory
Examples:
/nemp:save user-prefers-typescript User prefers TypeScript over JavaScript
/nemp:save project-uses-nextjs This project uses Next.js 14 with App Router

### 5. Sorting

Default sort: by `updated` date (most recent first)

## Output Fields
- **KEY**: The memory identifier
- **AGENT**: Who wrote this memory (main, nemp-init, backend, frontend, etc.)
- **UPDATED**: Last modified date (relative or absolute)
- **PREVIEW**: First 40 characters of the value

## Tips to Show User
After listing, remind user:
- Use `/nemp:recall <key>` to see full memory content
- Use `/nemp:forget <key>` to delete a memory
- Use `/nemp:context <keyword>` to search by topic
- Use `/nemp:log` to see access audit trail
