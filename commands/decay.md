---
description: "Cortex decay engine — update vitality scores and auto-archive extinct memories"
argument-hint: "[--dry-run | --verbose]"
---

# /nemp:decay

Run the Cortex decay engine to recalculate vitality scores for all memories, auto-archive extinct memories, detect access chains, and update Cortex intelligence metadata.

## Usage
```
/nemp:decay              # Run decay engine (apply all changes)
/nemp:decay --dry-run    # Preview changes without writing
/nemp:decay --verbose    # Show per-memory vitality details
```

## When This Runs

- Explicitly via `/nemp:decay`
- Via `/nemp:cortex --apply`
- Automatically after every 5 sessions (tracked in cortex.json `meta.session_count`)

## Instructions

When the user invokes `/nemp:decay`, execute ALL steps below in sequence.

### Step 0: Parse Arguments

```
--dry-run   → Calculate all changes but do NOT write any files. Show what would happen.
--verbose   → Show per-memory vitality breakdown in the report.
(no args)   → Apply all changes and show summary.
```

### Step 1: Load Memories and Config

Read `.nemp/memories.json` and `.nemp/cortex.json`.

If either file is missing, report an error and stop:
```
Error: Missing required file. Run /nemp:init first.
```

### Step 2: Apply Time Decay to Each Memory

For each memory in memories.json:

**2a. Calculate `days_since_last_read`:**
- If `vitality.last_read` is null or missing: use days since `created`
- Otherwise: use days between `vitality.last_read` and now (current date)

**2b. Determine type-specific decay multiplier:**

| Memory Type | Decay Multiplier | Rationale |
|-------------|-----------------|-----------|
| `temporary` | decay_rate x 4 | Designed to expire fast |
| `goal` | decay_rate x 0 | Protected while linked to active goal in cortex.json goals array |
| `warning` | decay_rate x 0 | Always preserved — safety critical |
| `error-pattern` | decay_rate x 1 | Normal decay, no special treatment |
| `assumption` | decay_rate x 3 | Unverified info should fade quickly |
| All other types | decay_rate x 1 | Standard decay rate |

Note: For `goal` type, only apply the x0 multiplier if the memory key appears in an active goal's `related_memories` in `cortex.json`. If the goal is completed or the memory is not linked to any goal, apply normal decay (x1).

**2c. Recalculate vitality score:**

Use the existing vitality fields on each memory to compute:

```
vitality_score = (
  (reads_7d x 15) +
  (reads_30d x 3) +
  (foresight_load_ratio x 20) +
  (agent_reference_ratio x 25) +
  (update_frequency x 10) +
  (goal_link_active x 15) -
  (correction_events x 10) -
  (days_since_last_read x effective_decay_rate)
)
```

Where:
- `reads_7d` = `vitality.reads_7d` (number of reads in last 7 days)
- `reads_30d` = `vitality.reads_30d` (number of reads in last 30 days)
- `foresight_load_ratio` = number of times loaded by foresight / total foresight runs (0-1)
- `agent_reference_ratio` = number of agent references / total agent actions (0-1)
- `update_frequency` = number of updates in last 30 days
- `goal_link_active` = 1 if linked to active goal, 0 otherwise
- `correction_events` = number of times this memory was corrected/overwritten
- `effective_decay_rate` = base `vitality.decay_rate` multiplied by the type-specific multiplier from Step 2b

**Clamp** the final score to the range 0-100.

**2d. Update `vitality.state`:**

| Score Range | State |
|-------------|-------|
| 80-100 | `thriving` |
| 50-79 | `active` |
| 20-49 | `fading` |
| 1-19 | `dormant` |
| 0 | `extinct` |

**2e. Update `vitality.trend`:**

Compare new score to previous `vitality.score`:
- new > old + 5: `"rising"`
- new < old - 5: `"falling"`
- otherwise: `"stable"`

### Step 3: Auto-Archive Extinct Memories

For each memory where ALL of these conditions are true:
- `vitality.state` == `"extinct"` (score is 0)
- `vitality.last_read` was more than 7 days ago, OR `last_read` is null AND `created` was more than 7 days ago

Perform the archive:

1. Read `.nemp/archive.json` (create with `{"archived": []}` if missing)
2. Add the full memory object to the `archived` array with these additional fields:
   - `archive_timestamp`: current ISO-8601 timestamp
   - `archive_reason`: `"extinct-7-days"`
   - `vitality_at_archive`: 0
   - `recoverable`: true
3. Remove the memory from `memories.json`
4. Append to `.nemp/evolution.log`:
   ```
   [ISO-8601-timestamp] ARCHIVE key=<key> vitality=0 reason=extinct-7-days
   ```
5. Increment `cortex.json` `meta.total_archives` by 1

If `--dry-run` is active, do NOT write changes. Instead report: `[DRY RUN] Would archive: <key>`

### Step 4: Update Read Window Counters

These counters need periodic adjustment since we don't maintain a full time-series:

For each memory:
- If `vitality.last_read` is more than 7 days ago: set `vitality.reads_7d` = 0
- If `vitality.last_read` is more than 30 days ago: set `vitality.reads_30d` = 0

### Step 5: Detect and Update Access Chains

Read `cortex.json` `access_sequences`. Look for repeating patterns:

1. Extract all sequences of length 2 or more from `access_sequences`
2. For each unique pair `[A, B]`, count how many sessions contain that pair in order
3. If a pair appears in 3 or more sessions:
   - Look at what key `C` was accessed after `B` in those sessions
   - Create or update a chain entry in `cortex.json` `chains`:
     ```json
     {
       "pattern": ["A", "B"],
       "next_predicted": "C",
       "confidence": observations / total_sessions_containing_A,
       "observations": N,
       "last_seen": "current ISO-8601 timestamp"
     }
     ```
   - If a chain for `[A, B]` already exists, update `observations`, `confidence`, and `last_seen`
4. Log each new chain to `evolution.log`:
   ```
   [ISO-8601-timestamp] CHAIN_DETECTED pattern=[A,B] predicts=C confidence=0.85
   ```

### Step 6: Update Cortex Meta

Update `cortex.json` `meta` fields:

- `session_count`: increment by 1
- `avg_memories_per_task`: average of all `episodes.json` `memories_loaded` array lengths (0 if no episodes)
- `most_useful_type`: the memory `type` with the highest average vitality score across all memories of that type
- `least_useful_type`: the memory `type` with the lowest average vitality score across all memories of that type
- `avg_confidence`: average of all memory `confidence.score` values (0 if none have confidence)
- `key_patterns_low_value`: array of key prefixes (e.g., `"old-"`, `"temp-"`, `"misc-"`) where the average vitality of memories with that prefix is below 20
- `last_reflection`: current ISO-8601 timestamp

### Step 7: Write All Changes

If `--dry-run` is NOT active:

1. Write updated `memories.json`
2. Write updated `cortex.json`
3. Append to `evolution.log`:
   ```
   [ISO-8601-timestamp] DECAY memories_processed=N archived=N chains_detected=N
   ```

### Step 8: Report

Display a summary report:

**Standard output:**
```
Cortex Decay Run
  Processed: N memories
  Vitality changes: N memories updated
  Archived: N memories (moved to archive.json)
  Chains detected: N new patterns
  Session count: N
```

**Verbose output (--verbose):**

Include per-memory details before the summary:
```
Cortex Decay Run (Verbose)

  Memory Vitality Details:
    auth-flow        : 85 thriving  (was 80, trend: rising)
    database-config  : 42 fading    (was 55, trend: falling)
    old-deploy-v1    :  0 extinct   (was 5, trend: falling) -> ARCHIVED
    ...

  Processed: N memories
  Vitality changes: N memories updated
  Archived: N memories (moved to archive.json)
  Chains detected: N new patterns
  Session count: N
```

**Dry-run output (--dry-run):**

Prefix report with `[DRY RUN]` and note that no files were modified:
```
[DRY RUN] Cortex Decay Preview
  Would process: N memories
  Would update vitality: N memories
  Would archive: N memories
  Would detect chains: N new patterns
  (No files modified)
```

## Error Handling

- If `.nemp/memories.json` is missing or invalid JSON: report error and stop
- If `.nemp/cortex.json` is missing or invalid JSON: report error and stop
- If `.nemp/archive.json` is missing when archiving: create it with `{"archived": []}`
- If `.nemp/evolution.log` is missing: create it with the standard header
- If `.nemp/episodes.json` is missing: skip episode-based calculations, use defaults
- Never delete memories without archiving them first
- All file writes should be atomic — calculate everything first, then write all changes

## Implementation Notes

**Use minimal bash commands.** Combine reads where possible:

```bash
# Read all needed files in one go
echo "=== MEMORIES ===" && cat .nemp/memories.json && \
echo "=== CORTEX ===" && cat .nemp/cortex.json && \
echo "=== EPISODES ===" && (cat .nemp/episodes.json 2>/dev/null || echo '{"episodes": []}') && \
echo "=== ARCHIVE ===" && (cat .nemp/archive.json 2>/dev/null || echo '{"archived": []}')
```

Then process all data and write changes in a single batch.

## Related Commands

- `/nemp:cortex` - Full Cortex intelligence engine
- `/nemp:health` - System health diagnostics
- `/nemp:list` - View all memories with vitality scores
- `/nemp:foresight` - Predictive memory loading
- `/nemp:recall` - Access a specific memory (updates read counters)
