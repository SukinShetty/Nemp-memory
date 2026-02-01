---
description: "Delete a memory by key"
argument-hint: "<key> [--force]"
---

# /nemp:forget

Delete a memory by key.

## Usage
```
/nemp:forget <key>
/nemp:forget <key> --force   # Skip confirmation
```

## Arguments
- `key`: The exact key of the memory to delete

## Instructions

When the user invokes `/nemp:forget`, follow these steps:

### 1. Find the Memory

Search for the memory in both storage locations:

```bash
# Check project memories
[ -f ".nemp/memories.json" ] && cat .nemp/memories.json

# Check global memories
[ -f "$HOME/.nemp/memories.json" ] && cat $HOME/.nemp/memories.json
```

### 2. Handle Not Found

If no memory with that key exists:
```
❌ Memory not found: "<key>"

Did you mean one of these?
  - auth-flow
  - auth-config
  - user-auth-prefs

Use `/nemp:list` to see all available keys.
```

### 3. Confirm Deletion (unless --force)

Show the memory content and ask for confirmation:
```
⚠️  Delete this memory?

  Key: <key>
  Value: "<full-value>"
  Created: <date>
  Source: project/global

Type 'yes' to confirm, or 'no' to cancel.
```

Use the AskUserQuestion tool with options:
- "Yes, delete it"
- "No, keep it"

### 4. Perform Deletion

If confirmed:
1. Read the appropriate memories.json file
2. Filter out the memory with the matching key
3. Write the updated array back to the file

### 5. Confirm to User

```
✓ Memory deleted: <key>
  Remaining memories: N
```

### 6. Handle Multiple Matches

If the same key exists in BOTH project and global storage (rare):
```
⚠️  Found "<key>" in multiple locations:

1. Project (.nemp/memories.json)
   Value: "<value>"

2. Global (~/.nemp/memories.json)
   Value: "<value>"

Which would you like to delete?
```

Use AskUserQuestion with options:
- "Delete from project only"
- "Delete from global only"
- "Delete from both"
- "Cancel"

## Error Handling
- If key is missing: Ask user to provide a key
- If file read/write fails: Report error with details
- If user cancels: Acknowledge and do nothing

## Example

User: `/nemp:forget old-api-endpoint`

```
⚠️  Delete this memory?

  Key: old-api-endpoint
  Value: "The legacy API was at api.example.com/v1"
  Created: 2024-01-05T08:00:00Z
  Source: project (.nemp/memories.json)
```

User confirms →
```
✓ Memory deleted: old-api-endpoint
  Remaining memories: 4
```
