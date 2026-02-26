---
description: "Run diagnostics on Nemp Memory health and integrity"
argument-hint: "[--fix | --verbose]"
---

# /nemp:health

Run a comprehensive health check on your Nemp Memory system. Detect corruption, stale data, sync drift, orphaned keys, and silent degradation — problems that other memory tools ignore until it's too late.

## Usage
```
/nemp:health              # Standard health check with score
/nemp:health --verbose    # Detailed output for every check
/nemp:health --fix        # Auto-fix issues where possible
```

## Why This Exists

Every memory tool assumes your data is fine. They silently degrade — ghost references, corrupted indexes, stale CLAUDE.md, orphaned keys. You don't notice until the agent makes a wrong decision based on bad context.

`/nemp:health` is the first memory diagnostics tool. It catches problems before they break your agent.

## Instructions

When the user invokes `/nemp:health`, run ALL checks below in sequence, then display a scored report.

### Step 0: Parse Arguments

```
--verbose  → Show details for every check (pass or fail)
--fix      → Auto-fix issues where safe to do so
(no args)  → Show summary with issues only
```

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

**--fix behavior:** If JSON is invalid, attempt to read raw content and report what's salvageable. Do NOT auto-fix corrupted JSON — too risky.

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
- Check for duplicate key names (shouldn't happen with JSON objects, but check for near-duplicates like "auth-flow" and "auth_flow" or "authflow")
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

**--fix behavior for Step 3:**
- Empty values → Remove the entry
- Missing timestamps → Add current timestamp
- Near-duplicate keys → Report but don't auto-merge (user decides)

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

**--fix behavior:** If stale or out of sync, run auto-sync (same as /nemp:auto-sync).

### Step 5: Access Log Health

```bash
[ -f ".nemp/access.log" ] && wc -l .nemp/access.log && head -1 .nemp/access.log && tail -1 .nemp/access.log || echo "NO_ACCESS_LOG"
```

**Checks:**
- Log file exists → ✅ or ⚠️
- Total entries count
- Date range (first entry to last entry)
- Any malformed entries (lines not matching `[timestamp] ACTION key=...`)
- Severity: ⚠️ WARNING for missing/malformed

**--fix behavior:** Create empty access.log if missing.

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

**--fix behavior:** Regenerate MEMORY.md from current memories.json.

### Step 8: Global Memory Check

```bash
[ -f "$HOME/.nemp/memories.json" ] && python3 -c "import json; data=json.load(open('$HOME/.nemp/memories.json')); print(f'VALID entries={len(data)}')" 2>&1 || echo "NO_GLOBAL"
```

**Checks:**
- Global memories exist → Report count or "none"
- Valid JSON → ✅ or ❌

### Step 9: Foresight Detector Check

Verify the Foresight domain detectors are functional by checking if the foresight command file exists and has the expected detector domains:

```bash
# Check if foresight command exists
[ -f ".claude/commands/nemp/foresight.md" ] && echo "FORESIGHT_EXISTS" || echo "NO_FORESIGHT"
```

**Expected detectors** (13 domains):
auth, database, api, frontend, backend, testing, deployment, state, styling, config, error, payment, cache

Report: `✅ Foresight: X/13 detectors configured` or `⚠️ Foresight not installed`

### Step 10: Calculate Health Score

Score each check on a weighted scale:

| Check | Weight | Pass | Fail |
|-------|--------|------|------|
| .nemp/ exists | 15 | 15 | 0 |
| memories.json valid | 20 | 20 | 0 |
| No empty values | 10 | 10 | -5 per empty |
| Values under 200 chars | 5 | 5 | -1 per oversized |
| Timestamps valid | 5 | 5 | -1 per invalid |
| CLAUDE.md in sync | 15 | 15 | 0 if stale |
| Access log exists | 5 | 5 | 0 |
| Config exists | 5 | 5 | 0 |
| MEMORY.md in sync | 5 | 5 | 0 |
| No duplicate keys | 5 | 5 | -2 per duplicate |
| Foresight active | 5 | 5 | 0 |
| Global memories valid | 5 | 5 | 0 |

**Total possible: 100**

**Score bands:**
- 90-100: 🟢 HEALTHY
- 70-89: 🟡 NEEDS ATTENTION
- 50-69: 🟠 DEGRADED
- 0-49: 🔴 CRITICAL

### Step 11: Display Report

**Standard output:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  NEMP MEMORY HEALTH CHECK                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  Score: 91/100 🟢 HEALTHY

  ✅ memories.json — 23 memories, all valid
  ✅ CLAUDE.md — in sync (last sync: 2 min ago)
  ⚠️ 2 memories exceed 200 char limit
  ❌ Key "auth-flow" has empty value
  ✅ Access log — 47 entries, no gaps
  ✅ Foresight — 13/13 detectors active
  ✅ Config — autoSync enabled
  ✅ Global — 4 global memories

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Issues found: 2
    ⚠️ auth-strategy: value is 247 chars (compress with /nemp:save)
    ❌ auth-flow: empty value (delete with /nemp:delete auth-flow)

  Quick fixes:
    /nemp:health --fix     Auto-fix safe issues
    /nemp:save <key> ...   Update specific memories
    /nemp:auto-sync        Force CLAUDE.md sync
```

**Verbose output (--verbose):**

Show EVERY check with pass/fail status, even passing ones:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  NEMP MEMORY HEALTH CHECK (VERBOSE)                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  Score: 91/100 🟢 HEALTHY

  STORAGE
  ✅ .nemp/ directory exists
  ✅ memories.json exists and valid (23 entries)
  ✅ No duplicate keys
  ✅ All keys are kebab-case
  ⚠️ 2 values exceed 200 chars:
     → auth-strategy (247 chars)
     → deploy-config (213 chars)
  ❌ 1 empty value:
     → auth-flow (empty string)
  ✅ All timestamps valid
  ✅ No future timestamps

  SYNC
  ✅ CLAUDE.md exists
  ✅ Nemp section found
  ✅ Last sync: 2026-02-20 08:15 (2 min ago)
  ✅ 23/23 memories synced to CLAUDE.md

  AUDIT
  ✅ Access log: 47 entries
  ✅ Date range: 2026-02-01 to 2026-02-20
  ✅ No malformed entries

  CONFIG
  ✅ config.json valid
  ✅ autoSync: enabled

  INDEX
  ✅ MEMORY.md exists
  ✅ 23/23 memories indexed

  FORESIGHT
  ✅ Foresight installed
  ✅ 13/13 domain detectors configured

  GLOBAL
  ✅ Global memories: 4 entries, valid JSON

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Issues: 3 (1 error, 2 warnings)
  Auto-fixable: 1

  /nemp:health --fix to auto-fix safe issues
```

**Fix output (--fix):**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  NEMP MEMORY HEALTH CHECK (AUTO-FIX)                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  🔧 Fixing issues...

  ✅ Removed empty memory: auth-flow
  ✅ Regenerated MEMORY.md index
  ✅ Created missing access.log
  ⚠️ Skipped: 2 oversized values (manual review needed)
     → /nemp:save auth-strategy "<shorter version>"
     → /nemp:save deploy-config "<shorter version>"

  Score: 95/100 🟢 HEALTHY (was 91/100)
```

## Implementation Notes

**IMPORTANT: Run ALL checks using minimal bash commands.** Combine checks where possible to reduce tool calls:

```bash
# Combined existence check (1 tool call instead of 7)
echo "=== FILES ===" && \
ls -la .nemp/memories.json .nemp/access.log .nemp/config.json .nemp/MEMORY.md CLAUDE.md 2>&1 && \
echo "=== MEMORIES ===" && \
python3 -c "
import json, sys
try:
    with open('.nemp/memories.json') as f:
        data = json.load(f)
    errors = []
    warnings = []
    for k, v in data.items():
        val = v if isinstance(v, str) else v.get('value', '') if isinstance(v, dict) else str(v)
        if not val or val.strip() == '':
            errors.append(f'EMPTY:{k}')
        elif len(val) > 200:
            warnings.append(f'LONG:{k}:{len(val)}')
        if isinstance(v, dict):
            if 'created' not in v:
                warnings.append(f'NO_CREATED:{k}')
            if 'updated' not in v:
                warnings.append(f'NO_UPDATED:{k}')
    print(f'TOTAL:{len(data)}')
    for e in errors: print(e)
    for w in warnings: print(w)
except json.JSONDecodeError as e:
    print(f'INVALID_JSON:{e}')
except FileNotFoundError:
    print('FILE_NOT_FOUND')
" 2>&1 && \
echo "=== CLAUDE_MD ===" && \
(grep -c "via Nemp Memory" CLAUDE.md 2>/dev/null && grep "Last updated" CLAUDE.md 2>/dev/null || echo "NO_NEMP_SECTION") && \
echo "=== ACCESS_LOG ===" && \
([ -f ".nemp/access.log" ] && wc -l < .nemp/access.log && head -1 .nemp/access.log && tail -1 .nemp/access.log || echo "NO_LOG") && \
echo "=== GLOBAL ===" && \
([ -f "$HOME/.nemp/memories.json" ] && python3 -c "import json; d=json.load(open('$HOME/.nemp/memories.json')); print(f'GLOBAL:{len(d)}')" 2>&1 || echo "NO_GLOBAL")
```

Parse the combined output to build the health report. This keeps tool calls to 1-2 instead of 10+.

## Error Handling

- If `.nemp/` doesn't exist → Stop with init prompt
- If memories.json is corrupted → Report error, suggest backup
- If any check fails → Continue other checks, report all issues
- Never auto-delete memories without explicit user consent (--fix only removes empty values)

## Related Commands

- `/nemp:init` - Initialize Nemp Memory
- `/nemp:auto-sync` - Force sync to CLAUDE.md
- `/nemp:list` - View all memories
- `/nemp:save` - Save or update a memory
- `/nemp:delete` - Remove a memory
- `/nemp:foresight` - Predictive memory loading
