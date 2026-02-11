---
description: "Retrieve a memory by key or search query"
argument-hint: "<key-or-query>"
---

# /nemp:recall

Retrieve a memory by exact key or fuzzy search.

## Usage
/nemp:recall <key-or-query>

## Arguments
- `key-or-query`: Either an exact memory key OR a natural language query to search memories

## Instructions

When the user invokes `/nemp:recall`, follow these steps:

### 1. Load All Memories
Read from both storage locations and merge:
```bash
# Read project memories if exists
[ -f ".nemp/memories.json" ] && cat .nemp/memories.json

# Read global memories if exists
[ -f "$HOME/.nemp/memories.json" ] && cat $HOME/.nemp/memories.json
```

### 2. Search Strategy

**Phase 1: Exact Key Match**
- Look for a memory where `key` exactly matches the query
- If found, return immediately

**Phase 2: Partial Key Match**
- Look for memories where the key CONTAINS the query (case-insensitive)
- Example: query "bun" matches key "user-prefers-bun"

**Phase 3: Value Search**
- Search the `value` field for the query terms (case-insensitive)
- Rank by number of matching words

**Phase 4: Fuzzy/Semantic Match (Basic)**
- If no matches found, look for semantically related terms
- Example: "package manager" might match "npm", "bun", "yarn" mentions
- This is basic keyword expansion for now; semantic embeddings come later

### 3. Log the Read Operation

**IMPORTANT: Always log read operations for audit trail.**

After finding a match, append to `.nemp/access.log`:
```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] READ key=<key> agent=${CLAUDE_AGENT_NAME:-main} query=<original-query>" >> .nemp/access.log
```

### 4. Return Results

**Single exact match:**
🔍 Memory: <key>
Value: <value>
Agent: <agent_id who wrote it>
Updated: <date>
Source: project/global

**Multiple matches:**
🔍 Found N memories matching "<query>":

[key-one] (by <agent_id>) - <truncated-value-preview>...
[key-two] (by <agent_id>) - <truncated-value-preview>...
[key-three] (by <agent_id>) - <truncated-value-preview>...

Use /nemp:recall <exact-key> for full details.

**No matches:**
❌ No memories found for "<query>"
Suggestions:

Use /nemp:list to see all available memories
Try different keywords
Save a new memory with /nemp:save


## Examples

### Exact key lookup
User: `/nemp:recall auth-flow`
📝 Memory: auth-flow
Value: "Authentication uses JWT access tokens (15min) with refresh tokens (7 days). Tokens stored in httpOnly cookies."
Created: 2024-01-15T10:30:00Z
Updated: 2024-01-20T14:22:00Z
Source: project (.nemp/memories.json)

### Natural language query
User: `/nemp:recall how does auth work`
🔍 Found 2 memories matching "how does auth work":

[auth-flow] - "Authentication uses JWT access tokens..."
[user-session-handling] - "Sessions expire after 30 days of inactivity..."

Use /nemp:recall <exact-key> for full details.

## Priority Order
1. Project memories (more relevant to current context)
2. Global memories (general preferences/knowledge)
