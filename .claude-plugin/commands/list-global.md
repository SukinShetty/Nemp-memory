---
description: "List all global memories"
argument-hint: ""
---

# /nemp:list-global

List all memories saved in global storage.

## Usage
```
/nemp:list-global
```

## Instructions

When the user invokes `/nemp:list-global`, follow these steps:

### 1. Load Global Memories

```bash
if [ -f "$HOME/.nemp/memories.json" ]; then
  cat "$HOME/.nemp/memories.json"
else
  echo '{"memories":[]}'
fi
```

### 2. Format Output

Display global memories in a clean table format:

```
Global Memory Index (~/.nemp/memories.json)

  KEY                     UPDATED          PREVIEW
  preferred-editor        2024-01-15       VS Code with Vim keybindings...
  git-workflow            2024-01-12       Always rebase, never merge...
  coding-style            2024-01-10       4 spaces, no tabs, trailing...

Total: 3 global memories
```

### 3. Empty State

If no global memories exist:
```
Global Memory Index (~/.nemp/memories.json)

No global memories saved yet.

Get started:
  /nemp:save-global <key> <value>  - Save your first global memory

Examples:
  /nemp:save-global preferred-editor VS Code with Vim keybindings
  /nemp:save-global git-workflow Always rebase, never merge commits
  /nemp:save-global coding-style 4 spaces indentation, trailing commas

Global memories are available across ALL projects.
```

### 4. Sorting

Default sort: by `updated` date (most recent first)

## Output Fields
- **KEY**: The memory identifier
- **UPDATED**: Last modified date
- **PREVIEW**: First 40 characters of the value

## Tips to Show User
After listing, remind user:
- Use `/nemp:recall-global <key>` to see full memory content
- Use `/nemp:forget-global <key>` to delete a global memory
- Use `/nemp:save-global <key> <new-value>` to update an existing memory
- Use `/nemp:list` to see both project AND global memories

## Difference from /nemp:list
- `/nemp:list-global` - Shows ONLY global memories
- `/nemp:list` - Shows BOTH project and global memories in separate sections
