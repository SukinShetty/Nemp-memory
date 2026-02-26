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

### 3b. Update Vitality Tracking

After logging to access.log, update the matched memory's vitality counters in memories.json:

1. Load the memory from the appropriate storage file (project or global)
2. If the memory lacks vitality fields, initialize with defaults first:
   - `type`: `"fact"`
   - `confidence`: `{"score": 0.65, "source": "agent-inferred", "reason": "Pre-cortex memory"}`
   - `vitality`: all counters set to 0, `score`: 50, `state`: "active", `trend`: "stable", `last_read`: null, `decay_rate`: 0.01
   - `links`: `{"goals": [], "conflicts": [], "supersedes": null, "superseded_by": null, "causal": []}`
3. Update these fields:
   ```
   vitality.reads += 1
   vitality.reads_7d += 1
   vitality.reads_30d += 1
   vitality.last_read = <current ISO-8601 timestamp>
   ```
4. Recalculate `vitality.score` using the formula:
   ```
   vitality = (
     (reads_7d × 15) +
     (reads_30d × 3) +
     (foresight_load_ratio × 20) +
     (agent_reference_ratio × 25) +
     (update_frequency × 10) +
     (goal_link_active × 15) -
     (correction_events × 10) -
     (days_since_last_read × decay_rate)
   )
   clamped to 0-100
   ```
   Where:
   - `foresight_load_ratio` = foresight_loads / (foresight_loads + foresight_skips), default 0 if both are 0
   - `agent_reference_ratio` = agent_references / reads, default 0 if reads is 0
   - `update_frequency` = update_count / max(1, days_since_created)
   - `goal_link_active` = 1 if links.goals has any active goal, else 0
5. Set `vitality.state` based on score:
   - 80-100: `"thriving"`
   - 50-79: `"active"`
   - 20-49: `"fading"`
   - 1-19: `"dormant"`
   - 0: `"extinct"`
6. Write the updated memory back to memories.json

### 4. Return Results

**Single exact match:**
🔍 Memory: <key>
Value: <value>
Type: <type> | Vitality: <vitality-score> (<vitality-state>) | Confidence: <confidence-score>
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
🔍 Memory: auth-flow
Value: "Authentication uses JWT access tokens (15min) with refresh tokens (7 days). Tokens stored in httpOnly cookies."
Type: procedure | Vitality: 94 (thriving) | Confidence: 0.91
Agent: main
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
