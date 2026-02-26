---
description: "Nemp Cortex — memory intelligence layer. Vitality, fusion, conflicts, learning, simulation."
argument-hint: "[status | --apply | --fuse | --chains | --history | insight <task> | resolve | learn | simulate <task> | trust | validate | goal <desc>]"
---

# /nemp:cortex

The intelligence layer on top of Nemp Memory. Cortex tracks memory vitality, detects fusion candidates, resolves conflicts, learns from past sessions, simulates future memory needs, and manages goals — turning raw key-value memories into a self-maintaining knowledge graph.

## Usage
```
/nemp:cortex                        Full cortex report
/nemp:cortex status                 One-liner status
/nemp:cortex --apply                Execute safe actions (archive, fuse, resolve)
/nemp:cortex --fuse                 Review fusion candidates
/nemp:cortex --chains               Show learned access chains
/nemp:cortex --history              Memory evolution timeline
/nemp:cortex insight <task>         Explain memory selection for a task
/nemp:cortex resolve                Interactive conflict resolution
/nemp:cortex learn                  Extract lessons from last episode
/nemp:cortex simulate <task>        Predict memory needs for a task
/nemp:cortex trust                  Trust and reliability dashboard
/nemp:cortex validate               Check memories against codebase
/nemp:cortex goal <desc>            Create or manage active goals
```

## Instructions

### Step 0: Parse Arguments

Extract the subcommand from the user's input:

```
(no args)          → Full report
status             → One-liner status
--apply            → Execute safe actions
--fuse             → Show fusion candidates
--chains           → Show learned access chains
--history          → Memory evolution timeline
insight <task>     → Explain memory selection for <task>
resolve            → Interactive conflict resolution
learn              → Extract lessons from last episode
simulate <task>    → Predict memory needs for <task>
trust              → Trust/reliability dashboard
validate           → Check memories against codebase
goal <desc>        → Create/manage goals
```

Route to the matching section below. If the argument doesn't match any subcommand, show the Usage block above and stop.

---

## /nemp:cortex (no args) — Full Report

### Step 1: Load All Data

Read these files using the Read tool:
- `.nemp/memories.json` — required (if missing, show "Run /nemp:init first." and stop)
- `.nemp/cortex.json` — optional (if missing, use empty defaults: `{"conflicts": [], "chains": [], "goals": [], "fusions": []}`)
- `.nemp/episodes.json` — optional (if missing, use empty array `[]`)

**Backward compatibility:** For each memory missing cortex fields, initialize with defaults before any calculations:
- `type`: `"fact"`
- `confidence`: `{"score": 0.65, "source": "agent-inferred", "reason": "Pre-cortex memory"}`
- `vitality`: all counters set to 0, `score`: 50, `state`: "active", `trend`: "stable", `last_read`: null, `decay_rate`: 0.01
- `links`: `{"goals": [], "conflicts": [], "supersedes": null, "superseded_by": null, "causal": []}`

### Step 2: Calculate Vitality for All Memories

For each memory, compute vitality score:

```
reads        = vitality.reads or 0
reads_7d     = vitality.reads_7d or 0
reads_30d    = vitality.reads_30d or 0
update_count = vitality.update_count or 0
foresight_loads = vitality.foresight_loads or 0
foresight_skips = vitality.foresight_skips or 0
agent_references = vitality.agent_references or 0
correction_events = vitality.correction_events or 0

days_since_created = (now - memory.created) in days
days_since_last_read = (now - vitality.last_read) in days
    If last_read is null, use days_since_created

type_multiplier:
  "temporary" → 4
  "goal" with any active linked goal → 0
  "warning" → 0
  "assumption" → 3
  all others → 1

effective_decay = decay_rate * type_multiplier

vitality_score = clamp(0, 100,
  reads_7d * 15
  + reads_30d * 3
  + (foresight_loads / (foresight_loads + foresight_skips + 0.001)) * 20
  + (agent_references / (reads + 0.001)) * 25
  + (update_count / max(1, days_since_created)) * 10
  + (15 if goals non-empty and any linked goal is active else 0)
  - correction_events * 10
  - days_since_last_read * effective_decay
)

vitality_state:
  >= 80 → "thriving"
  >= 50 → "active"
  >= 20 → "fading"
  >= 1  → "dormant"
  == 0  → "extinct"
```

### Step 3: Detect Fusion Candidates

For each pair of memories, check if **at least 2** of these conditions are true:

1. **Key stem match:** Split keys on `-`, compare first part. Match if same.
2. **Value keyword overlap:** Extract words > 4 chars (excluding stopwords: a, an, the, is, it, be, do, of, or, and, but, not, for, with, have, that, this, from, into, also, been, were, they, will, each, than, very). Match if 3+ shared keywords.
3. **Co-access:** Both memories appear in the same `episode.memories_loaded` array in 5+ episodes.
4. **Same type:** Both memories have the same `type` field.

Flag all pairs meeting the threshold as fusion candidates.

### Step 4: Detect Conflicts

**4a.** Load existing conflicts from `cortex.json` conflicts array.

**4b.** Scan memories for new potential conflicts:
- Find keys in the same family (same first stem when split on `-`)
- Check if their values reference opposing versions, URLs, or settings
- For each new conflict found, add to cortex.json conflicts array with `status: "suspected"`

### Step 5: Calculate Trust Score

```
avg_confidence = average of all memory confidence.score values
thriving_count = count of memories with vitality_state == "thriving"
total_memories = total memory count
conflict_count = count of unresolved conflicts (status != "resolved")
correction_prone_count = count of memories with correction_events >= 3

trust = clamp(0, 100,
  avg_confidence * 40
  + (thriving_count / total_memories) * 30
  + (1 - conflict_count / max(1, total_memories)) * 20
  + (1 - correction_prone_count / max(1, total_memories)) * 10
)
```

Note: the components are already scaled to produce a 0-100 result (avg_confidence ∈ [0,1] × 40 = 0-40, ratios ∈ [0,1] × 30/20/10). No additional multiplier needed.

### Step 6: Calculate Foresight Accuracy

From `episodes.json`, take the last 30 episodes only:

```
For each episode:
  loaded = set of episode.memories_loaded keys
  referenced = set of episode.memories_referenced keys
  hits += count of keys in both loaded and referenced
  total_loaded += count of loaded

accuracy = (hits / max(1, total_loaded)) * 100
```

If no episodes exist, report "N/A".

### Step 7: Display Full Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEMP CORTEX REPORT — <date>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VITALITY OVERVIEW
  Total: N memories | N reads total
  Thriving (80+): N — [keys]
  Active (50-79):  N — [keys]
  Fading (20-49):  N — [keys]
  Dormant (1-19):  N — [keys]
  Extinct (0):     N — [keys]

TRUST & ACCURACY
  Trust Score: NN/100
  Foresight Accuracy: NN% (last 30 episodes)
  Avg Confidence: 0.NN

INTELLIGENCE
  Fusion Candidates: N pairs
  Unresolved Conflicts: N
  Active Goals: N
  Sessions Tracked: N

SUGGESTED ACTIONS
  1. [specific action based on findings, e.g. "Archive 2 extinct memories: old-key, stale-key"]
  2. [next action, e.g. "Review 1 fusion candidate: auth-flow + auth-config"]
  3. [next action, e.g. "Resolve conflict between db-url and database-url"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/nemp:cortex status     Quick one-liner
/nemp:cortex --apply    Execute safe actions
/nemp:cortex --fuse     Review fusion candidates
/nemp:cortex resolve    Fix conflicts
```

Generate the SUGGESTED ACTIONS list dynamically based on findings:
- If extinct memories exist: suggest archiving them
- If fusion candidates exist: suggest reviewing them
- If unresolved conflicts exist: suggest resolving them
- If foresight accuracy < 60%: suggest reviewing memory relevance
- If correction-prone memories exist: suggest verifying them
- If no issues found: "Memory state is healthy. No actions needed."

### Step 8: Log the Operation

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=report memories=<n> trust=<score> fusions=<n> conflicts=<n>" >> .nemp/access.log
```

---

## /nemp:cortex status

### Step 1: Load Data

Read `.nemp/memories.json` and `.nemp/cortex.json` (use defaults if cortex.json missing).

### Step 2: Quick Calculate

Initialize cortex fields with defaults for any memory missing them (same backward compat as full report).

Count:
- Total memories
- Thriving count (vitality >= 80)
- Extinct count (vitality == 0)
- Fusion candidate count (from cortex.json fusions array, or 0)
- Unresolved conflict count (from cortex.json conflicts where status != "resolved")
- Foresight accuracy (from episodes.json last 30 episodes, or "N/A")
- Trust score (quick calculation from Step 5 of full report)

### Step 3: Display Single Line

```
CORTEX: N memories | N thriving | N extinct | N fusions | N conflicts | NN% accuracy | trust: NN%
```

### Step 4: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=status" >> .nemp/access.log
```

---

## /nemp:cortex --apply

### Step 1: Load Data

Read:
- `.nemp/memories.json` — required
- `.nemp/cortex.json` — optional (defaults if missing)
- `.nemp/archive.json` — optional (create as empty array `[]` if missing)

### Step 2: Archive Extinct Memories

**Pre-Cortex Grace Period (Archive Protection):**
Before archiving any memory, check if it is protected:
```
cortex_activated = settings.cortex_activated from cortex.json (null if missing)

PROTECTED if ALL true:
  1. cortex_activated is not null
  2. memory.created < cortex_activated   (predates Cortex tracking)
  3. (now - cortex_activated) < 14 days  (within grace period)
```
Skip protected memories — do not archive them.

For each memory with vitality state == "extinct" **that is not protected**:
- Check if `last_read > 7 days ago` OR (`last_read` is null AND `created > 7 days ago`)
- If yes:
  - Add to `archive.json` with additional fields: `archive_reason: "extinct-7-days"`, `archive_timestamp: "<now ISO-8601>"`, `recoverable: true`
  - Remove from `memories.json`
  - Log: `[timestamp] ARCHIVE key=<key> reason=extinct-7-days` to `.nemp/evolution.log`

### Step 3: Apply Approved Fusions

For each entry in `cortex.json` fusions array where `status == "approved"`:
- Create the new fused memory in `memories.json` using the stored `fused_key` and `fused_value`
- Move both original memories to `archive.json` with `archive_reason: "fused-into-<fused_key>"`
- Remove originals from `memories.json`
- Update cortex.json fusion entry: `status: "applied"`
- Log: `[timestamp] FUSE key=<key-a>+<key-b> into=<fused_key>` to `.nemp/evolution.log`

### Step 4: Resolve Confirmed Conflicts

For each entry in `cortex.json` conflicts array where `status == "confirmed"` and `resolution` is set:
- Apply the stored resolution action (update memory value, archive one side, etc.)
- Update conflict entry: `status: "resolved"`, `resolved_at: "<now>"`
- Log: `[timestamp] RESOLVE conflict=<description>` to `.nemp/evolution.log`

### Step 5: Update CLAUDE.md

Read `.nemp/config.json`. If `autoSync` is enabled:
- Re-generate the Nemp section of CLAUDE.md with the updated memories (same logic as `/nemp:auto-sync`)

### Step 6: Write Updated Files

Write back all modified files:
- `.nemp/memories.json`
- `.nemp/cortex.json`
- `.nemp/archive.json`
- `.nemp/evolution.log` (append only)
- `CLAUDE.md` (if autoSync)

### Step 7: Display Report

```
Cortex --apply complete

  Archived: N memories
  Fused: N memories into M memories
  Resolved: N conflicts
  CLAUDE.md: updated (or: skipped — autoSync disabled)

  Log: .nemp/evolution.log
```

If nothing to do: "Cortex --apply: nothing to do. All memories are healthy."

### Step 8: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=apply archived=<n> fused=<n> resolved=<n>" >> .nemp/access.log
```

---

## /nemp:cortex --fuse

### Step 1: Load Memories

Read `.nemp/memories.json`. Initialize cortex fields with defaults for any memory missing them.

### Step 2: Find Fusion Candidates

Use the same algorithm as full report Step 3:
- For each pair, check if at least 2 of the 4 conditions are true
- Collect all qualifying pairs

### Step 3: Display Candidates

For each candidate pair:

```
FUSION CANDIDATE #N:
  [key-a] (reads: N, vitality: N)
  Value: "<value-a>"

  [key-b] (reads: N, vitality: N)
  Value: "<value-b>"

  Overlap: [list shared keywords]
  Co-access: N times

  SUGGESTED FUSION -> [proposed-key]:
  "<Generate a concise merged value combining both>"

  Type: <common-type> | Confidence: 0.60 (auto-fused)
  Token savings: ~N%

  To approve: /nemp:save <proposed-key> "<fused-value>"
  Then archive originals: /nemp:cortex --apply
```

Generate the proposed key by keeping the common stem and appending a descriptive suffix if needed.

Generate the fused value by combining the most important information from both values into a single concise string.

Calculate token savings as: `round((len(value_a) + len(value_b) - len(fused_value)) / (len(value_a) + len(value_b)) * 100)`

If no candidates found:
```
No fusion candidates detected. Memories are sufficiently distinct.
```

### Step 4: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=fuse candidates=<n>" >> .nemp/access.log
```

---

## /nemp:cortex --chains

### Step 1: Load Data

Read `.nemp/cortex.json`. If missing or chains array is empty, skip to Step 3.

### Step 2: Display Chains

```
LEARNED ACCESS CHAINS

  [auth-flow] -> [database] -> predicts: [api-routes]
  Confidence: 0.85 | Observed: 7 sessions | Last seen: <date>

  [framework] -> [stack] -> predicts: [package-manager]
  Confidence: 0.67 | Observed: 4 sessions | Last seen: <date>

N chains detected from N sessions
```

For each chain in `cortex.json` chains array, display:
- The chain sequence of memory keys
- Confidence score
- Number of sessions where this chain was observed
- Date of most recent observation

### Step 3: No Chains

If no chains exist:
```
No patterns detected yet. Chains form after 3+ sessions with the same access sequence.
```

### Step 4: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=chains" >> .nemp/access.log
```

---

## /nemp:cortex --history

### Step 1: Load Data

Read:
- `.nemp/memories.json` — active memories
- `.nemp/archive.json` — archived memories (empty array if missing)
- `.nemp/evolution.log` — evolution events (empty if missing)

### Step 2: Build Timeline

For each memory (active + archived), build a timeline entry showing:
- Creation date and creator
- Number of updates and last update date
- Total reads and current vitality score/state
- Current status (ACTIVE, ARCHIVED with reason, FUSED)

### Step 3: Display

```
MEMORY EVOLUTION TIMELINE

  auth-flow
  +-- created: Feb 4, 2026 (by main)
  +-- updated: 3x (last: Feb 26)
  +-- reads: 47 | vitality: 94 -> thriving
  +-- status: ACTIVE

  old-todo-format
  +-- created: Feb 4, 2026
  +-- reads: 1 | vitality: 0
  +-- status: ARCHIVED (Feb 26 — extinct 7 days)

  auth-system [FUSED]
  +-- created: Feb 26, 2026 (fused from auth-flow + login-config)
  +-- status: ACTIVE
```

Sort entries by creation date, newest first.

If no memories exist: "No memories found. Run /nemp:init to get started."

### Step 4: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=history" >> .nemp/access.log
```

---

## /nemp:cortex insight <task>

### Step 1: Parse Task

Extract `<task>` from the arguments after "insight". If no task is provided:
```
Usage: /nemp:cortex insight <task description>

Example: /nemp:cortex insight "add Google OAuth login"
```

### Step 2: Load Data

Read `.nemp/memories.json` and `.nemp/cortex.json` (defaults if missing). Initialize cortex fields with defaults for any memory missing them.

### Step 3: Score Memories

Apply the full foresight scoring algorithm from `/nemp:foresight` (domain detection, keyword matching, key name matching, recency scoring, core key floor).

### Step 4: Apply Cortex Modifiers

After base scoring, apply:

1. **Vitality multiplier:**
   - Thriving: score * 1.25
   - Dormant: score * 0.5
   - Extinct: score = 0 (exclude)

2. **Type floors:**
   - Goal type: score = max(score, 0.40)
   - Warning type: score = max(score, 0.35)

3. **Chain prediction boost:**
   - If a known chain from cortex.json matches recent access patterns, boost the predicted next memory by +0.15

4. **Goal link boost:**
   - If memory is linked to an active goal relevant to the task, boost by +0.10

### Step 5: Display Explanation

```
CORTEX INSIGHT: "<task>"

Would load:
  [key] (semantic match: "word1","word2" | vitality: N | <state>)
  [key] (goal-linked: <goal-name> | vitality: N)
  [key] (chain prediction from [prev-key] | +0.15 boost)

Would skip:
  [key] (dormant | confidence: 0.NN)
  [key] (extinct | archived)

Warnings:
  [key] has N correction events — verify before relying
  [key] + [key] co-loaded in past failures (causal link)

Estimated token budget: ~NNN tokens
```

Calculate token budget as approximate character count of all loaded memory values divided by 4.

### Step 6: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=insight task=\"<first 50 chars>\" loaded=<n> skipped=<n>" >> .nemp/access.log
```

---

## /nemp:cortex resolve

### Step 1: Load Data

Read `.nemp/cortex.json` and `.nemp/memories.json`. If cortex.json has no conflicts array or it is empty, skip to Step 3.

### Step 2: Display Each Conflict

For each conflict with status "suspected" or "confirmed":

```
CONFLICT #N: <description>

  [key-a]: "<value-a>" (updated: <date>, confidence: 0.NN)
  [key-b]: "<value-b>" (updated: <date>, confidence: 0.NN)

  Suggested: <suggested_resolution from cortex.json, or "No suggestion — manual review needed">

  Resolution options:
    1. Replace [key-a] with [key-b]'s value
    2. Split by scope (add environment context)
    3. Mark [key-a] as obsolete (superseded_by: [key-b])
    4. Keep both with note
    5. Skip for now
```

After displaying all conflicts:
```
To resolve: use /nemp:save to update the correct memory, then the conflict will be auto-cleared on next /nemp:cortex run.

Or use /nemp:forget <key> to remove the obsolete memory.
```

### Step 3: No Conflicts

If no conflicts:
```
No conflicts detected. Memory state is consistent.
```

### Step 4: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=resolve conflicts=<n>" >> .nemp/access.log
```

---

## /nemp:cortex learn

### Step 1: Load Episodes

Read `.nemp/episodes.json`. If missing or empty, skip to Step 4.

### Step 2: Find Last Completed Episode

Find the most recent episode where `outcome` is not `"unknown"` and not `"abandoned"`. If none found, skip to Step 4.

### Step 3: Extract and Display Lessons

Analyze the episode:
- Which memories were loaded (`memories_loaded` array)
- Which memories were actually referenced by the agent (`memories_referenced` array)
- Were there corrections during the episode
- What was the outcome

```
CORTEX LEARN: "<episode goal>"
Outcome: <outcome>

From this task, Cortex suggests saving these lessons:

  Lesson 1: <insight based on what memories were useful>
  Suggested key: lesson-<domain>-<short-desc>
  Type: procedure | Confidence: 0.95 (outcome-validated)

  Lesson 2: <insight based on what was missing or underused>
  Suggested key: lesson-<domain>-<short-desc>
  Type: fact | Confidence: 0.80

To save: /nemp:save <key> "<value>"

Memories loaded but NOT referenced by agent:
  [key] — loaded N times in tasks but rarely referenced. Consider reviewing.
```

Generate lessons based on:
- If certain memories were always loaded and referenced: they are reliable context
- If memories were loaded but never referenced: they may be irrelevant or poorly keyed
- If corrections happened: the original memory may need updating
- If outcome was success: validate the memories used
- If outcome was failure: flag memories involved

### Step 4: No Episodes

If no completed episodes:
```
No completed episodes yet. Run /nemp:foresight with a task to start tracking.
```

### Step 5: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=learn lessons=<n>" >> .nemp/access.log
```

---

## /nemp:cortex simulate <task>

### Step 1: Parse Task

Extract `<task>` from the arguments after "simulate". If no task is provided:
```
Usage: /nemp:cortex simulate <task description>

Example: /nemp:cortex simulate "migrate database from MySQL to PostgreSQL"
```

### Step 2: Load Data

Read `.nemp/memories.json`, `.nemp/cortex.json` (defaults if missing), and `.nemp/episodes.json` (empty if missing). Initialize cortex fields with defaults for any memory missing them.

### Step 3: Score Memories

Run foresight scoring (same as `/nemp:foresight` Step 4 and Step 5) against the task to identify relevant memories and their scores.

### Step 4: Identify Gaps

Analyze the task description for topics/domains that have no matching memories:
- Run domain detection (same signal word table as foresight)
- For each active domain, check if any memory scored above threshold for that domain
- If a domain is active but no memories cover it, flag as a gap

### Step 5: Identify Risks

Check for:
- Memories with `correction_events >= 2` — may contain inaccurate information
- Memories with `confidence.score < 0.50` — low confidence, may mislead
- Causal links: check cortex.json for memory pairs that were co-loaded during failed episodes

### Step 6: Display Simulation

```
CORTEX SIMULATION: "<task>"

Predicted memory needs:
  [key] (high relevance, <state>)
  [key] (medium relevance, <state>)
  [key] (low relevance, <state>)

Memory gaps (no coverage):
  [topic] — no memory found for this aspect
  [topic] — consider saving before starting

Risks:
  [key] has N correction events — verify accuracy
  [key] confidence: 0.NN (low) — may mislead
  Causal risk: [key-a] + [key-b] together led to errors N times

Suggested prep:
  1. Save [missing topic]: /nemp:save <key> "<value>"
  2. Verify [risky key]: /nemp:recall <key>
  3. Review conflict: /nemp:cortex resolve
```

Categorize relevance:
- high: score >= 0.60
- medium: score >= 0.30
- low: score >= threshold (0.15 default)

### Step 7: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=simulate task=\"<first 50 chars>\" predicted=<n> gaps=<n> risks=<n>" >> .nemp/access.log
```

---

## /nemp:cortex trust

### Step 1: Load Data

Read `.nemp/memories.json` and `.nemp/cortex.json` (defaults if missing). Initialize cortex fields with defaults for any memory missing them.

### Step 2: Categorize by Confidence

Group memories by confidence score:
- High: `score >= 0.80`
- Medium: `0.50 <= score < 0.80`
- Low: `0.30 <= score < 0.50`
- Unverified: `score < 0.30`

### Step 3: Identify Problem Memories

- **Conflict-prone:** memories appearing in cortex.json conflicts array with status != "resolved"
- **Correction-prone:** memories with `vitality.correction_events >= 3`
- **Stale:** memories where `last_read` or `updated` is more than 30 days ago

### Step 4: Calculate Trust Score

Use the same formula as full report Step 5.

### Step 5: Display Trust Report

```
CORTEX TRUST REPORT
Overall Trust Score: NN/100

By confidence:
  High (0.80+):      N memories — [keys]
  Medium (0.50-0.79): N memories — [keys]
  Low (0.30-0.49):    N memories — [keys]
  Unverified (<0.30): N memories — [keys]

Conflict-prone: N memories involved in active conflicts
Correction-prone: N memories with 3+ correction events
Stale: N memories not validated in 30+ days

Recommendations:
  1. [specific action for worst issue]
  2. [next action]

/nemp:cortex validate    Check memories against codebase
/nemp:cortex resolve     Fix conflicts
```

### Step 6: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=trust score=<n>" >> .nemp/access.log
```

---

## /nemp:cortex validate

### Step 1: Load Memories

Read `.nemp/memories.json`. Initialize cortex fields with defaults for any memory missing them.

### Step 2: Check Config Files

Run a combined existence check:

```bash
ls package.json .env .env.local .env.example tsconfig.json 2>/dev/null
```

### Step 3: Validate Against Each File

For each file that exists, read it and cross-reference with relevant memories:

**package.json:**
- Check `stack` memory against actual dependencies listed
- Check `framework` memory against framework packages (next, react, vue, etc.)
- Check `database` or `database-orm` memory against ORM/DB packages (prisma, drizzle, mongoose, etc.)
- Check `auth-provider` memory against auth packages (next-auth, passport, etc.)
- Check `testing` memory against test packages (jest, vitest, playwright, etc.)
- Check `package-manager` memory — if package-lock.json exists it's npm, if yarn.lock it's yarn, if pnpm-lock.yaml it's pnpm, if bun.lockb it's bun

**tsconfig.json:**
- If exists, verify `framework` memory mentions TypeScript

**.env / .env.example:**
- Check `database` memory against DATABASE_URL value pattern
- Check any URL-type memories against env var values

**Directory structure:**
```bash
ls -d src/ app/ pages/ components/ lib/ prisma/ 2>/dev/null
```
- Verify structure-related memories match actual folders

### Step 4: Display Results

```
Checking N memories against codebase...

  framework: "Next.js..." — confirmed (package.json has next@...)
  database: "PostgreSQL..." — confirmed (.env has DATABASE_URL=postgres...)
  auth-flow: "bcrypt rounds: 12" — cannot verify (not in config files)
  api-version: "v2" — INVALIDATED (package.json shows different version)

Validated: N | Unverifiable: N | Invalidated: N
```

### Step 5: Update Confidence Scores

For each result:
- **Confirmed:** Set `confidence.score` to 0.85, `confidence.source` to `"observed-from-code"`
- **Invalidated:** Set `confidence.score` to 0.30, `confidence.source` to `"invalidated"`
- **Unverifiable:** Leave confidence unchanged

Write updated memories back to `.nemp/memories.json`.

### Step 6: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=validate confirmed=<n> invalidated=<n> unverifiable=<n>" >> .nemp/access.log
```

---

## /nemp:cortex goal <desc>

### Step 1: Parse Arguments

Extract `<desc>` from the arguments after "goal".

Three cases:
- **No desc:** Show existing goals
- **desc is "complete <goal-id>":** Mark goal as completed
- **desc is a new description:** Create a new goal

### Step 2a: No Description — List Goals

Read `.nemp/cortex.json`. Display active goals:

```
ACTIVE GOALS (N)
  [goal-id]: "<description>" — created: <date>
    Linked memories: [key1], [key2]
    Subgoals: N complete, N pending

/nemp:cortex goal "Description" to create a new goal
/nemp:cortex goal complete <goal-id> to complete a goal
```

If no goals: "No active goals. Create one with /nemp:cortex goal \"Description\""

### Step 2b: Complete a Goal

If desc starts with "complete ":
- Extract goal-id from the rest of the string
- Find the goal in cortex.json goals array
- Set `status: "completed"`, `completed_at: "<now>"`
- Extract any lessons: check which linked memories were heavily used vs ignored
- Offer to archive linked temporary memories

Display:
```
Goal completed: [goal-id]

Linked memories review:
  [key] — 12 reads during goal period. Keep.
  [key] — 0 reads. Archive? Use /nemp:forget <key>
```

### Step 2c: New Goal

Generate a goal entry:
```json
{
  "goal_id": "goal-<slug-from-desc>",
  "description": "<desc>",
  "status": "active",
  "priority": "medium",
  "created": "<now ISO-8601>",
  "linked_memories": [],
  "subgoals": [],
  "lessons": []
}
```

Generate the slug by lowercasing the description, taking the first 4-5 significant words, joining with hyphens.

**Auto-link memories:** Scan all memories for keys or values that contain keywords from the goal description. Add matching memory keys to `linked_memories`.

Add the goal to `cortex.json` goals array. Write cortex.json.

Display:
```
Goal created: [goal-id]
Linked N memories: [key1], [key2], ...

Track progress: /nemp:cortex goal
Complete it: /nemp:cortex goal complete [goal-id]
```

### Step 3: Log

```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] CORTEX agent=main subcommand=goal action=<list|complete|create> goal=<goal-id>" >> .nemp/access.log
```

---

## Implementation Notes

**Combined data loading:** Where possible, read all needed files in parallel using multiple Read tool calls to minimize round trips.

**File writes:** Only write files that were actually modified. Do not rewrite files that haven't changed.

**Backward compatibility:** Always initialize missing cortex fields with defaults before calculations. Never assume memories have cortex fields — they may be pre-cortex memories.

**Error handling:**
- If `.nemp/` doesn't exist: show "Run /nemp:init to initialize Nemp Memory." and stop
- If `memories.json` is missing or invalid: show error and stop
- If `cortex.json` is missing: use empty defaults, create it on first write
- If `episodes.json` is missing: treat as empty, skip episode-dependent features
- Never delete or modify memories without explicit user action

## Related Commands

- `/nemp:foresight` — Predictive memory loading (Cortex enhances its scoring)
- `/nemp:health` — System diagnostics
- `/nemp:save` — Save or update a memory
- `/nemp:forget` — Remove a memory
- `/nemp:list` — View all memory keys
- `/nemp:recall` — View a specific memory
- `/nemp:auto-sync` — Sync memories to CLAUDE.md
