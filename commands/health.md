---
description: "Run diagnostics on Nemp Memory health and integrity"
argument-hint: ""
---

# /nemp:health

Run a health check on your Nemp Memory system. Detect corruption, stale data, sync drift, orphaned keys, and silent degradation before they cause problems.

## Usage
```
/nemp:health    # Run health check with score and issues list
```

## Why This Exists

Every memory tool assumes your data is fine. They silently degrade — ghost references, corrupted indexes, stale CLAUDE.md, orphaned keys. You don't notice until the agent makes a wrong decision based on bad context.

`/nemp:health` catches problems before they break your agent.

## Instructions

When the user invokes `/nemp:health`, run ALL checks below in sequence, then display a scored report.

### Step 1: Check .nemp/ Directory Exists

```bash
[ -d ".nemp" ] && echo "NEMP_DIR_EXISTS" || echo "NEMP_DIR_MISSING"
```

If `.nemp/` doesn't exist:
```
❌ CRITICAL: No .nemp/ directory found.

Run /nemp:init to initialize Nemp Memory.
```
**Stop here** — no further checks possible.

### Step 2: Check memories.json Exists and Is Valid JSON

```bash
[ -f ".nemp/memories.json" ] && python3 -c "import json; data=json.load(open('.nemp/memories.json')); print(f'VALID_JSON entries={len(data)}')" 2>&1 || echo "MISSING_OR_INVALID"
```

**Checks:**
- File exists → ✅ or ❌
- Valid JSON → ✅ or ❌ (report parse error line if invalid)
- Entry count → Report number

### Step 3: Memory Integrity Checks

For each memory entry in memories.json, verify:

**3a. Key format:**
- Keys should be kebab-case (lowercase, hyphens)
- Flag keys with spaces, uppercase, or special characters
- Severity: ⚠️ WARNING

**3b. Value length:**
- Values should be under 200 characters (compressed)
- Flag values over 200 chars
- Severity: ⚠️ WARNING

**3c. Empty values:**
- Flag any memory where value is empty string, null, or undefined
- Severity: ❌ ERROR

**3d. Duplicate keys:**
- Check for near-duplicates like "auth-flow" and "auth_flow" or "authflow"
- Severity: ⚠️ WARNING

**3e. Timestamp integrity:**
- `created` should be a valid ISO-8601 date
- `updated` should be >= `created`
- No timestamps in the future
- Severity: ⚠️ WARNING

**3f. Missing required fields:**
- Every entry should have: key, value, created, updated
- Flag entries missing any of these
- Severity: ⚠️ WARNING

### Step 4: CLAUDE.md Sync Check

```bash
[ -f "CLAUDE.md" ] && echo "CLAUDE_MD_EXISTS" || echo "CLAUDE_MD_MISSING"
```

**4a. CLAUDE.md exists?**
- ✅ exists or ⚠️ missing

**4b. Nemp section present?**
- Look for `## Project Context (via Nemp Memory)`
- ✅ found or ⚠️ no Nemp section

**4c. Sync freshness:**
- Extract "Last updated:" timestamp from Nemp section
- Compare to most recent `updated` timestamp in memories.json
- If memories are newer than CLAUDE.md → ⚠️ STALE
- Report time difference

**4d. Content drift:**
- Count memories in memories.json
- Count entries in CLAUDE.md Nemp section
- If counts differ → ⚠️ OUT OF SYNC
- List which memories are missing from CLAUDE.md

### Step 5: Access Log Health

```bash
[ -f ".nemp/access.log" ] && wc -l .nemp/access.log && head -1 .nemp/access.log && tail -1 .nemp/access.log || echo "NO_ACCESS_LOG"
```

**Checks:**
- Log file exists → ✅ or ⚠️
- Total entries count
- Date range (first entry to last entry)
- Any malformed entries
- Severity: ⚠️ WARNING for missing/malformed

### Step 6: Config Check

```bash
[ -f ".nemp/config.json" ] && cat .nemp/config.json || echo "NO_CONFIG"
```

**Checks:**
- Config file exists → ✅ or ⚠️
- autoSync setting → Report current value
- Valid JSON → ✅ or ❌

### Step 7: MEMORY.md Index Check

```bash
[ -f ".nemp/MEMORY.md" ] && echo "MEMORY_MD_EXISTS" || echo "MEMORY_MD_MISSING"
```

**Checks:**
- File exists → ✅ or ⚠️
- If exists, check if memory count matches memories.json
- Severity: ⚠️ WARNING if missing or out of sync

### Step 8: Global Memory Check

```bash
[ -f "$HOME/.nemp/memories.json" ] && python3 -c "import json; data=json.load(open('$HOME/.nemp/memories.json')); print(f'VALID entries={len(data)}')" 2>&1 || echo "NO_GLOBAL"
```

**Checks:**
- Global memories exist → Report count or "none"
- Valid JSON → ✅ or ❌

### Step 9: Cortex Data Check

```bash
[ -f ".nemp/cortex.json" ] && echo "CORTEX_EXISTS" || echo "NO_CORTEX"
[ -f ".nemp/episodes.json" ] && echo "EPISODES_EXISTS" || echo "NO_EPISODES"
[ -f ".nemp/archive.json" ] && echo "ARCHIVE_EXISTS" || echo "NO_ARCHIVE"
```

**Checks:**
- cortex.json exists → Report or note missing
- Count extinct memories in memories.json → ℹ️ if any
- Count memories with `vitality.state == "fading"` or `"dormant"` → ℹ️ if any

### Step 10: Calculate Health Score

Score each check on a weighted scale:

| Check | Weight | Pass | Fail |
|-------|--------|------|------|
| .nemp/ exists | 10 | 10 | 0 |
| memories.json valid | 18 | 18 | 0 |
| No empty values | 7 | 7 | -4 per empty |
| Values under 200 chars | 5 | 5 | -1 per oversized |
| Timestamps valid | 5 | 5 | -1 per invalid |
| CLAUDE.md in sync | 10 | 10 | 0 if stale |
| Access log exists | 5 | 5 | 0 |
| Config exists | 5 | 5 | 0 |
| MEMORY.md in sync | 5 | 5 | 0 |
| No duplicate keys | 5 | 5 | -2 per duplicate |
| Global memories valid | 5 | 5 | 0 |

**Total possible: 80**

**Score bands:**
- 72-80: 🟢 HEALTHY
- 56-71: 🟡 NEEDS ATTENTION
- 40-55: 🟠 DEGRADED
- 0-39: 🔴 CRITICAL

### Step 11: Display Report

```
Nemp Memory Health Check

  Score: 73/80 🟢 HEALTHY

  ✅ memories.json — 23 memories, all valid
  ✅ CLAUDE.md — in sync (last sync: 2 min ago)
  ⚠️ 2 memories exceed 200 char limit
  ❌ Key "auth-flow" has empty value
  ✅ Access log — 47 entries, no gaps
  ✅ Config — autoSync enabled
  ✅ Global — 4 global memories

  Issues found: 2
    ⚠️ auth-strategy: value is 247 chars (compress with /nemp:save)
    ❌ auth-flow: empty value (delete with /nemp:forget auth-flow)

  Quick fix:
    /nemp:save auth-strategy "<shorter version>"
    /nemp:forget auth-flow
```

If no issues found:
```
  ✅ All checks passed. Memory system is healthy.
```

## Error Handling

- If `.nemp/` doesn't exist → Stop with init prompt
- If memories.json is corrupted → Report error, suggest backup
- If any check fails → Continue other checks, report all issues

## Related Commands

- `/nemp:init` — Initialize Nemp Memory
- `/nemp:export` — Sync memories to CLAUDE.md
- `/nemp:list` — View all memories
- `/nemp:save` — Save or update a memory
- `/nemp:forget` — Remove a memory

---

## Nemp Pro

Unlock advanced diagnostics with [Nemp Pro](https://nemp.dev/pro):

- `/nemp:health --verbose` — Show pass/fail status for every check
- `/nemp:health --fix` — Auto-fix safe issues (empty values, missing files)
- `/nemp:cortex` — Memory intelligence with trust scores and conflict detection

Already have a license? Run `/nemp:activate <key>` to unlock.
