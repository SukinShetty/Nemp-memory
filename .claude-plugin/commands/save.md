---
description: "Save a key-value memory entry to persistent storage"
argument-hint: "<key> <value>"
---

Save a memory to persistent storage.

## Usage
```
/nemp:save <key> <value>
```

## Arguments
- `key`: A unique identifier for this memory (use kebab-case, e.g., `user-prefers-bun`, `auth-flow-jwt`)
- `value`: The content to remember (string, can be multi-word)

## Instructions

When the user invokes `/nemp:save`, follow these steps:

### 1. Parse Arguments
Extract the key (first argument) and value (everything after the key).

### 2. Determine Storage Location
- **Global storage**: `~/.nemp/memories.json` (cross-project memories)
- **Project storage**: `.nemp/memories.json` in current working directory (project-specific)

Default to **project storage** if inside a git repository, otherwise use global storage.

### 3. Read or Initialize Storage
Use Bash to check if the storage file exists and read it:

```bash
# For project storage
if [ -f ".nemp/memories.json" ]; then
  cat .nemp/memories.json
else
  mkdir -p .nemp && echo '{"memories":[]}' > .nemp/memories.json
fi
```

### 4. Create Memory Entry
Create a memory object with this structure:
```json
{
  "key": "<user-provided-key>",
  "value": "<user-provided-value>",
  "created": "<ISO-8601-timestamp>",
  "updated": "<ISO-8601-timestamp>",
  "projectPath": "<current-working-directory-or-null>",
  "tags": []
}
```

### 5. Update or Insert
- If a memory with the same key exists, UPDATE it (preserve `created`, update `updated` and `value`)
- If no memory with that key exists, INSERT the new memory

### 6. Write Back to Storage
Write the updated memories array back to the JSON file using the Write tool.

### 7. Confirm to User
Tell the user:
- ✓ Memory saved: `<key>`
- Storage location: project/global
- Total memories: N

## Example

User: `/nemp:save user-prefers-bun User prefers Bun over npm for package management`

Response:
```
✓ Memory saved: user-prefers-bun
  Value: "User prefers Bun over npm for package management"
  Location: .nemp/memories.json (project)
  Total memories: 5
```

## Error Handling
- If key is missing: Ask user to provide a key
- If value is missing: Ask user to provide a value
- If write fails: Report the error and suggest checking permissions
