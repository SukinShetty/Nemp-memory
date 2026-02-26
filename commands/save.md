---
description: "Save a key-value memory entry to persistent storage"
argument-hint: "<key> <value>"
---

Save a memory to persistent storage.

## Usage
/nemp:save <key> <value>

## Arguments
- `key`: A unique identifier for this memory (use kebab-case, e.g., `user-prefers-bun`, `auth-flow-jwt`)
- `value`: The content to remember (string, can be multi-word)

## Instructions

When the user invokes `/nemp:save`, follow these steps:

### 1. Parse Arguments
Extract the key (first argument) and value (everything after the key).

### 2. Compress Value (Token Optimization)

**IMPORTANT: Always compress the value before storing to minimize token usage.**

Apply these compression rules:
- Remove filler words: "basically", "essentially", "the thing is", "it's worth noting"
- Remove redundant phrases: "in order to" → "to", "due to the fact that" → "because"
- Collapse whitespace and trim
- Keep under 200 characters when possible — summarize longer values to their essential facts
- Preserve all technical terms, file paths, package names, and version numbers exactly

**Example compressions:**
BEFORE: "We decided to use NextAuth.js for authentication because it integrates well with Next.js and supports multiple providers including Google and GitHub OAuth"
AFTER:  "NextAuth.js auth with Google + GitHub OAuth providers"
BEFORE: "The database is PostgreSQL and we access it through the Prisma ORM which handles all our migrations and schema management"
AFTER:  "PostgreSQL via Prisma ORM (migrations + schema)"

### 3. Determine Storage Location
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
  mkdir -p .nemp && echo '{}' > .nemp/memories.json
fi
```

### 5. Detect Agent Identity

Determine who is saving this memory:
```bash
echo "${CLAUDE_AGENT_NAME:-main}"
```

Set `agent_id` to the agent name if available, otherwise `"main"`.

### 6. Create Memory Entry
Create a memory object with this structure:
```json
{
  "key": "<user-provided-key>",
  "value": "<compressed-value>",
  "created": "<ISO-8601-timestamp>",
  "updated": "<ISO-8601-timestamp>",
  "agent_id": "<agent-name-or-main>",
  "projectPath": "<current-working-directory-or-null>",
  "tags": []
}
```

### 6b. Auto-Type Inference

After creating the base memory object, infer the memory type if not explicitly provided:

**If the user passed a `--type <type>` flag**, use that value directly. Valid types: `fact`, `rule`, `preference`, `procedure`, `decision`, `assumption`, `temporary`, `goal`, `warning`, `error-pattern`, `hypothesis`.

**Otherwise, apply these inference rules (first match wins):**
- Key contains "todo", "fix", "temp" → `temporary`
- Key contains "config", "setup" → `fact`
- Key contains "bug", "error", "issue" → `error-pattern`
- Key contains "goal", "milestone" → `goal`
- Value starts with "always", "never", "must" → `rule`
- Value starts with "try", "maybe", "consider" → `hypothesis`
- Default: `fact`

**Set `decay_rate` based on the inferred type:**
| Type | Decay Rate |
|------|-----------|
| `fact` | 0.01/day |
| `rule` | 0.01/day |
| `preference` | 0.02/day |
| `procedure` | 0.02/day |
| `decision` | 0.03/day |
| `assumption` | 0.03/day |
| `temporary` | 0.08/day |
| `goal` | 0 (no decay while active) |
| `warning` | 0 (no decay) |
| `error-pattern` | 0.02/day |
| `hypothesis` | 0.06/day |

### 6c. Initialize Cortex Fields

Add these fields to every new memory entry alongside the base fields from Step 6:

```json
{
  "type": "<inferred-type-from-6b>",
  "confidence": {
    "score": 0.90,
    "source": "user-confirmed",
    "reason": "Manually saved by user"
  },
  "vitality": {
    "score": 50,
    "trend": "stable",
    "state": "active",
    "reads": 0,
    "last_read": null,
    "reads_7d": 0,
    "reads_30d": 0,
    "foresight_loads": 0,
    "foresight_skips": 0,
    "agent_references": 0,
    "update_count": 0,
    "correction_events": 0,
    "decay_rate": "<type-based-rate-from-6b>"
  },
  "links": {
    "goals": [],
    "conflicts": [],
    "supersedes": null,
    "superseded_by": null,
    "causal": []
  }
}
```

### 6d. Update Existing Memories (Cortex Preservation)

When UPDATING an existing key (not inserting new):
1. Increment `vitality.update_count` by 1
2. Preserve ALL existing cortex fields (`type`, `confidence`, `vitality`, `links`)
3. Only overwrite `value`, `updated`, and `agent_id` as before
4. If the existing memory lacks cortex fields (pre-cortex memory), initialize them with defaults:
   - `type`: `"fact"`
   - `confidence`: `{"score": 0.65, "source": "agent-inferred", "reason": "Pre-cortex memory"}`
   - `vitality`: all fields set to 0/null, `score`: 50, `state`: "active", `trend`: "stable"
   - `links`: `{"goals": [], "conflicts": [], "supersedes": null, "superseded_by": null, "causal": []}`

### 7. Update or Insert
- If a memory with the same key exists, UPDATE it (preserve `created`, update `updated`, `value`, and `agent_id`). Apply Step 6d for cortex field preservation.
- If no memory with that key exists, INSERT the new memory with cortex fields from Step 6c

### 8. Write Back to Storage
Write the updated memories array back to the JSON file using the Write tool.

### 9. Log the Write Operation

**IMPORTANT: Always log write operations for audit trail.**

Append to `.nemp/access.log`:
```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WRITE key=<key> agent=<agent_id> chars=<value_length>" >> .nemp/access.log
```

### 9b. Contradiction Check

After logging, scan existing memories for key-family overlap to detect potential conflicts:

1. Extract the **key family** from the saved key: the first word(s) before the last hyphen segment. Example: `auth-provider` → family is `auth`, `db-connection-url` → family is `db-connection`.
2. Search all memories for keys that share the same first stem (first word before the first hyphen).
3. For each match, compare values for opposing language:
   - Different version numbers (e.g., "v1" vs "v2", "14" vs "16")
   - Different URLs or paths
   - Different tool/library names for the same purpose
   - Contradicting instructions ("always" vs "never", "use X" vs "use Y")
4. If a potential conflict is detected, append a warning to the output:
   ```
   ⚠️ Possible conflict with [other-key] — check /nemp:cortex resolve
   ```

Do NOT block the save. This is an informational warning only.

### 10. Check Auto-Sync Config (REQUIRED)

**IMPORTANT: This step is MANDATORY. Always check and execute auto-sync if enabled.**

Read the config file to check if auto-sync is enabled:
```bash
[ -f ".nemp/config.json" ] && cat .nemp/config.json
```

If `.nemp/config.json` exists and contains `"autoSync": true`:

**10a. Read all memories** from `.nemp/memories.json`

**10b. Group memories by category** using these rules:
- Keys containing "project" → "Project Info"
- Keys containing "stack", "storage", "structure" → "Technical Details"
- Keys containing "feature", "command" → "Features"
- All other keys → "Other"

**10c. Generate CLAUDE.md content:**
```markdown
## Project Context (via Nemp Memory)

> Auto-generated by Nemp Memory. Last updated: [YYYY-MM-DD HH:MM]

### [Category Name]

| Key | Value |
|-----|-------|
| **key-name** | value content |

---
```

**10d. Update CLAUDE.md:**
- If CLAUDE.md does NOT exist: Create it with the generated content
- If CLAUDE.md exists with `## Project Context (via Nemp Memory)`: Replace everything from that heading to the next `---` (inclusive)
- If CLAUDE.md exists without Nemp section: Append the generated content at the end

**10e. Set `syncPerformed = true`** for the confirmation message

### 11. Confirm to User

Tell the user:
- ✓ Memory saved: `<key>`
- Type: `<type>` | Confidence: `<confidence-score>`
- Agent: `<agent_id>`
- Storage location: project/global
- Total memories: N
- If syncPerformed: `✓ CLAUDE.md synced`

## Example

User: `/nemp:save user-prefers-bun User prefers Bun over npm for package management`

**Response (with auto-sync enabled):**
✓ Memory saved: user-prefers-bun
Value: "Bun over npm for package management"
Type: preference | Confidence: 0.90
Agent: main
Location: .nemp/memories.json (project)
Total memories: 5
✓ CLAUDE.md synced

**Response (without auto-sync):**
✓ Memory saved: user-prefers-bun
Value: "Bun over npm for package management"
Type: preference | Confidence: 0.90
Agent: main
Location: .nemp/memories.json (project)
Total memories: 5

## Error Handling
- If key is missing: Ask user to provide a key
- If value is missing: Ask user to provide a value
- If write fails: Report the error and suggest checking permissions
- If auto-sync fails: Report briefly but don't fail the save operation
