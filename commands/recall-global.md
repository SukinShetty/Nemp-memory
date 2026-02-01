---
description: "Retrieve a global memory"
argument-hint: "<key>"
---

# /nemp:recall-global

Retrieve a memory from global storage by exact key or search.

## Usage
```
/nemp:recall-global <key-or-query>
```

## Arguments
- `key-or-query`: Either an exact memory key OR a natural language query to search global memories

## Instructions

When the user invokes `/nemp:recall-global`, follow these steps:

### 1. Load Global Memories
Read ONLY from global storage:

```bash
if [ -f "$HOME/.nemp/memories.json" ]; then
  cat "$HOME/.nemp/memories.json"
else
  echo '{"memories":[]}'
fi
```

### 2. Search Strategy

**Phase 1: Exact Key Match**
- Look for a memory where `key` exactly matches the query
- If found, return immediately

**Phase 2: Partial Key Match**
- Look for memories where the key CONTAINS the query (case-insensitive)
- Example: query "editor" matches key "preferred-editor"

**Phase 3: Value Search**
- Search the `value` field for the query terms (case-insensitive)
- Rank by number of matching words

### 3. Return Results

**Single exact match:**
```
Memory (global): <key>
   Value: <value>
   Created: <date>
   Updated: <date>
```

**Multiple matches:**
```
Found N global memories matching "<query>":

1. [key-one] - <truncated-value-preview>...
2. [key-two] - <truncated-value-preview>...

Use `/nemp:recall-global <exact-key>` for full details.
```

**No matches:**
```
No global memories found for "<query>"

Suggestions:
- Use `/nemp:list-global` to see all global memories
- Try different keywords
- Save a new global memory with `/nemp:save-global`
- Check project memories with `/nemp:recall`
```

## Examples

### Exact key lookup
User: `/nemp:recall-global preferred-editor`
```
Memory (global): preferred-editor
   Value: "VS Code with Vim keybindings and Monokai theme"
   Created: 2024-01-10T08:00:00Z
   Updated: 2024-01-15T10:30:00Z
```

### Search query
User: `/nemp:recall-global git workflow`
```
Found 2 global memories matching "git workflow":

1. [git-workflow] - "Always rebase, never merge. Use conventional commits..."
2. [git-hooks] - "Pre-commit: lint + format. Pre-push: run tests..."

Use `/nemp:recall-global <exact-key>` for full details.
```

## Note
This command only searches global memories (`~/.nemp/memories.json`).
To search both project and global memories, use `/nemp:recall` instead.
