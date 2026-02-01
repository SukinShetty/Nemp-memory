---
description: "Save a memory globally across all projects"
argument-hint: "<key> <value>"
---

# /nemp:save-global

Save a memory to global storage that persists across all projects.

## Usage
```
/nemp:save-global <key> <value>
```

## Arguments
- `key`: A unique identifier for this memory (use kebab-case, e.g., `preferred-editor`, `git-workflow`)
- `value`: The content to remember (string, can be multi-word)

## Instructions

When the user invokes `/nemp:save-global`, follow these steps:

### 1. Parse Arguments
Extract the key (first argument) and value (everything after the key).

### 2. Storage Location
Always use global storage: `~/.nemp/memories.json`

This memory will be available in ALL projects.

### 3. Ensure Directory Exists
Create the ~/.nemp directory if it doesn't exist:

```bash
mkdir -p "$HOME/.nemp"
```

### 4. Read or Initialize Storage
Check if the storage file exists and read it:

```bash
if [ -f "$HOME/.nemp/memories.json" ]; then
  cat "$HOME/.nemp/memories.json"
else
  echo '{"memories":[]}' > "$HOME/.nemp/memories.json"
  echo '{"memories":[]}'
fi
```

### 5. Create Memory Entry
Create a memory object with this structure:
```json
{
  "key": "<user-provided-key>",
  "value": "<user-provided-value>",
  "created": "<ISO-8601-timestamp>",
  "updated": "<ISO-8601-timestamp>",
  "projectPath": null,
  "tags": [],
  "scope": "global"
}
```

### 6. Update or Insert
- If a memory with the same key exists, UPDATE it (preserve `created`, update `updated` and `value`)
- If no memory with that key exists, INSERT the new memory

### 7. Write Back to Storage
Write the updated memories array back to `~/.nemp/memories.json` using the Write tool.

### 8. Confirm to User
Tell the user:
- Memory saved globally: `<key>`
- Storage location: ~/.nemp/memories.json
- Total global memories: N

## Example

User: `/nemp:save-global preferred-editor VS Code with Vim keybindings and Monokai theme`

Response:
```
Memory saved globally: preferred-editor
  Value: "VS Code with Vim keybindings and Monokai theme"
  Location: ~/.nemp/memories.json (global)
  Total global memories: 3
```

## Error Handling
- If key is missing: Ask user to provide a key
- If value is missing: Ask user to provide a value
- If write fails: Report the error and suggest checking permissions
- If HOME directory cannot be determined: Report error and suggest using project-level save instead

## When to Use Global vs Project Memories

**Use global (`/nemp:save-global`) for:**
- Personal preferences (editor, theme, workflow)
- Cross-project standards (coding style, commit conventions)
- General knowledge that applies everywhere

**Use project (`/nemp:save`) for:**
- Project-specific architecture decisions
- API keys or connection strings (project-specific)
- Codebase-specific patterns
