# NEMP CORTEX — Complete Build Specification

**Tagline:** *"Memory that thinks."*

**What it is:** The intelligence layer of Nemp. Cortex turns passive memory storage into a self-evolving, self-correcting cognitive system. It tracks what agents use, learns why it matters, predicts what's needed next, detects its own contradictions, validates itself against reality, and rewrites memories into better forms — all locally, zero cloud, zero ML models.

**Why it exists:** Every AI memory tool today (Mem0, Zep, claude-mem, Supermemory) is a filing cabinet. Nemp Cortex is the first memory system that behaves like a brain.

---

## ARCHITECTURE OVERVIEW

Cortex has **4 tiers** of capability, each building on the last:

```
┌─────────────────────────────────────────────────────┐
│  TIER 4: COGNITIVE LAYER                            │
│  Simulate · Learn · Resolve · Insight               │
├─────────────────────────────────────────────────────┤
│  TIER 3: INTELLIGENCE LAYER                         │
│  Prediction Chains · Fusion · Semantic Compression  │
│  Contradiction Engine · Reflection · Correction     │
├─────────────────────────────────────────────────────┤
│  TIER 2: CLASSIFICATION LAYER                       │
│  Memory Typing · Confidence · Vitality Scoring      │
│  Goal Linking · Scoped Contexts                     │
├─────────────────────────────────────────────────────┤
│  TIER 1: TRACKING LAYER                             │
│  Usage Tracking · Episodic Memory · Causal Links    │
│  Access Chains · Agent Reference Detection          │
└─────────────────────────────────────────────────────┘
```

---

## TIER 1: TRACKING LAYER (Foundation)

Everything starts here. Without tracking, Cortex is guessing.

### 1.1 Enhanced Memory Schema

Every memory in `memories.json` gains new fields:

```json
{
  "key": "auth-flow",
  "value": "JWT auth with bcrypt, refresh tokens, CSRF protection",
  "created": "2026-02-04T12:00:00Z",
  "updated": "2026-02-26T13:00:00Z",

  "type": "procedure",
  "confidence": {
    "score": 0.91,
    "source": "user-confirmed",
    "reason": "Manually saved by user after verifying auth config"
  },
  "scope": null,

  "vitality": {
    "score": 94,
    "trend": "rising",
    "state": "thriving",
    "reads": 47,
    "last_read": "2026-02-26T12:30:00Z",
    "reads_7d": 12,
    "reads_30d": 38,
    "foresight_loads": 23,
    "foresight_skips": 4,
    "agent_references": 15,
    "update_count": 3,
    "correction_events": 0,
    "decay_rate": 0.02
  },

  "links": {
    "goals": ["secure-login"],
    "conflicts": [],
    "supersedes": null,
    "superseded_by": null,
    "causal": []
  }
}
```

### 1.2 Memory Types

Every memory MUST have a `type` field. This controls decay behavior, Foresight boosting, and Cortex classification.

| Type | Purpose | Decay Rate | Foresight Behavior |
|------|---------|------------|-------------------|
| `fact` | Stable truth about the project | Very slow (0.01/day) | Standard |
| `rule` | Instruction or constraint | Very slow (0.01/day) | Boost when matching domain |
| `preference` | Stylistic or team choice | Slow (0.02/day) | Standard |
| `procedure` | Step-by-step how-to | Slow (0.02/day) | Boost on matching tasks |
| `decision` | A choice that was made | Medium (0.03/day) | Standard |
| `assumption` | Working belief, may be wrong | Medium (0.03/day) | Add warning flag |
| `temporary` | Short-lived context | Fast (0.08/day) | Lower priority |
| `goal` | Active objective | No decay while active | Always boost |
| `warning` | Risk to avoid | No decay | Boost on risky tasks |
| `error-pattern` | Known failure mode | Slow (0.02/day) | Boost when similar task |
| `hypothesis` | Experimental belief | Fast (0.06/day) | Add uncertainty flag |

**Auto-type inference:** When user runs `/nemp:save` without a type, Cortex analyzes the key + value and suggests a type:
- Key contains "todo", "fix", "temp" → `temporary`
- Key contains "config", "setup" → `fact`
- Key contains "bug", "error", "issue" → `error-pattern`
- Key contains "goal", "milestone" → `goal`
- Value starts with "always", "never", "must" → `rule`
- Value starts with "try", "maybe", "consider" → `hypothesis`
- Default: `fact`

### 1.3 Usage Tracking Hooks

Every read path must increment counters:

| Read Path | Increments |
|-----------|-----------|
| `/nemp:recall <key>` | `reads`, `reads_7d`, `reads_30d`, `last_read` |
| `/nemp:context` | Same as recall for each returned memory |
| `/nemp:foresight` (selected) | Same + `foresight_loads` |
| `/nemp:foresight` (available but not selected) | `foresight_skips` |
| CLAUDE.md auto-load | `reads` + mark as auto-loaded |
| `/nemp:list` | No increment (browsing ≠ using) |

**Agent reference detection:** After the agent produces output, Cortex scans for mentions of memory keys in the agent's response. If found, increment `agent_references`. This tells us: did the agent actually USE this memory, or just receive it?

Implementation: At the end of each tool response, check if any memory keys appear in the conversation context since last check.

### 1.4 Episodic Memory

Store compact task histories in `.nemp/episodes.json`:

```json
{
  "episodes": [
    {
      "episode_id": "ep-2026-02-26-001",
      "timestamp": "2026-02-26T14:30:00Z",
      "goal": "Fix token expiry issue",
      "memories_loaded": ["auth-flow", "session-mgmt", "api-routes"],
      "memories_referenced": ["auth-flow", "session-mgmt"],
      "actions_taken": ["read code", "edited config", "updated middleware"],
      "outcome": "success",
      "user_feedback": null,
      "lessons": [],
      "correction_applied": false
    }
  ]
}
```

**When to create an episode:**
- After `/nemp:foresight` loads memories for a task → start episode
- Track which memories the agent references during the task
- When user gives feedback (correction, approval, next task) → close episode
- If task abandoned → close with `outcome: "abandoned"`

**Episode outcomes:** `success`, `partial-success`, `failure`, `abandoned`, `unknown`

### 1.5 Causal Links

Track cause-effect relationships between memories and outcomes:

```json
{
  "causal_links": [
    {
      "cause": "old-auth-config",
      "effect": "incorrect-token-fix",
      "type": "memory-led-to-error",
      "confidence": 0.67,
      "evidence_count": 4,
      "episodes": ["ep-2026-02-20-003", "ep-2026-02-22-001"]
    },
    {
      "cause": "auth-flow",
      "context": "session-mgmt",
      "effect": "successful-auth-debug",
      "type": "memory-combination-success",
      "confidence": 0.82,
      "evidence_count": 6
    }
  ]
}
```

**Causal link types:**
- `memory-led-to-error` — this memory was loaded during tasks that failed
- `memory-led-to-success` — this memory was loaded during successful tasks
- `memory-combination-success` — these memories TOGETHER led to good outcomes
- `memory-combination-risk` — these memories TOGETHER often led to errors

Causal links are built from episodic memory. After accumulating 3+ episodes with the same pattern, Cortex creates a causal link.

### 1.6 Access Chains (Prediction Data)

Track sequences of memory access within sessions:

```json
{
  "chains": [
    {
      "pattern": ["auth-flow", "database"],
      "next_predicted": "api-routes",
      "confidence": 0.85,
      "observations": 7
    }
  ]
}
```

Built by logging the ORDER memories are accessed in each session. After 3+ observations of the same sequence, create a chain.

---

## TIER 2: CLASSIFICATION LAYER

### 2.1 Confidence Scoring

Every memory gets a confidence object:

```json
{
  "confidence": {
    "score": 0.91,
    "source": "user-confirmed",
    "reason": "Manually saved by user after verifying auth config"
  }
}
```

**Confidence sources (ranked high to low):**

| Source | Default Score | Meaning |
|--------|--------------|---------|
| `outcome-validated` | 0.95 | Memory contributed to successful task outcomes |
| `user-confirmed` | 0.90 | User explicitly saved or confirmed |
| `observed-from-code` | 0.85 | Extracted from package.json, config files |
| `observed-from-config` | 0.80 | Extracted from env, settings |
| `agent-inferred` | 0.65 | Agent generated during task |
| `auto-fused` | 0.60 | Created by Cortex fusion |
| `stale-unverified` | 0.30 | Hasn't been validated in 30+ days |

**Confidence rules:**
- Low confidence + high usage → Cortex suggests review ("You rely on this but it's unverified")
- Low confidence memories NEVER overwrite high confidence memories automatically
- Confidence decays by 0.01/week if not re-validated
- Correction events reduce confidence by 0.15 per event

### 2.2 Vitality Scoring (Enhanced Heat Score)

Vitality is a 0-100 score that factors in MORE than just read count:

```
vitality = (
  (reads_7d × 15) +                    # recent usage weight
  (reads_30d × 3) +                     # broader usage
  (foresight_load_ratio × 20) +         # how often Foresight actually chose it
  (agent_reference_ratio × 25) +        # did agent USE it in output?
  (update_frequency × 10) +             # frequently updated = alive
  (goal_link_active × 15) -             # linked to active goal = boost
  (correction_events × 10) -            # associated with errors = penalize
  (days_since_last_read × decay_rate)   # time decay
)
clamped to 0-100
```

Where:
- `foresight_load_ratio` = `foresight_loads / (foresight_loads + foresight_skips)`
- `agent_reference_ratio` = `agent_references / reads`
- `update_frequency` = `update_count / days_since_created`
- `goal_link_active` = 1 if linked to any active goal, else 0

**Vitality states:**

| State | Score | Behavior |
|-------|-------|----------|
| **Thriving** | 80-100 | Foresight always includes. Core memory. |
| **Active** | 50-79 | Normal behavior. |
| **Fading** | 20-49 | Cortex alerts: "This memory is losing relevance." |
| **Dormant** | 1-19 | Excluded from Foresight. Archive candidate. |
| **Extinct** | 0 | Auto-archived after 7 days at 0. Recoverable. |

**Type-specific decay:** Memory type affects `decay_rate`:
- `temporary` decays 4x faster → short-lived by design
- `goal` doesn't decay while linked goal is active
- `warning` and `error-pattern` don't decay → safety information persists
- `assumption` decays 3x faster → forces regular re-validation

### 2.3 Goal Memory

Active goals stored in `.nemp/cortex.json`:

```json
{
  "goals": [
    {
      "goal_id": "fix-login-bug",
      "status": "active",
      "priority": "high",
      "created": "2026-02-25T10:00:00Z",
      "linked_memories": ["auth-flow", "session-mgmt", "token-config"],
      "subgoals": [
        {"id": "find-expiry-source", "status": "done"},
        {"id": "verify-refresh-flow", "status": "active"},
        {"id": "test-cookie-behavior", "status": "pending"}
      ],
      "lessons": []
    }
  ]
}
```

**Goal behaviors:**
- Memories linked to active goals get vitality boost (+15)
- When a goal completes, Cortex extracts lessons from its episodes
- `temporary` memories linked ONLY to completed goals → auto-archive
- Goals can be created via `/nemp:cortex goal "Fix login bug"` or auto-detected from Foresight context

### 2.4 Scoped Contexts (Perspective Memory)

Memories can be scoped to environments/contexts:

```json
{
  "key": "api-base-url",
  "scope": {
    "environment": "staging",
    "version": "v2"
  },
  "value": "/api/v2"
}
```

**Why this matters:** Without scope, "JWT expires in 7 days" (production) and "JWT expires in 24h" (staging) look like contradictions when they're not.

**Scope fields (all optional):**
- `environment`: staging, production, development, testing
- `version`: v1, v2, etc.
- `platform`: web, mobile, desktop
- `role`: admin, user, guest

**Behavior:** When resolving contradictions, Cortex first checks if the conflict is actually a scope difference. If yes, it doesn't flag it as a conflict — it suggests adding scope instead.

---

## TIER 3: INTELLIGENCE LAYER

### 3.1 Prediction Chains

When Cortex sees the beginning of a known access pattern, it pre-stages memories.

**How it works:**
1. Log memory access order per session in `access_sequences`
2. After 3+ sessions with same sequence, create a chain
3. When Foresight runs and current memories match start of a chain, boost the predicted next memory

**Storage in `cortex.json`:**
```json
{
  "chains": [
    {
      "pattern": ["auth-flow", "database"],
      "next_predicted": "api-routes",
      "confidence": 0.85,
      "observations": 7,
      "last_seen": "2026-02-26T12:00:00Z"
    }
  ]
}
```

**Foresight integration:** If current task loads memories matching `pattern`, add `next_predicted` with a +15 relevance bonus.

### 3.2 Memory Fusion (Consolidation)

Detect overlapping memories and generate fused replacements.

**Detection criteria (any 2 of these = fusion candidate):**
- Keys share word stems (e.g., `auth-flow` and `auth-config`)
- Values share 3+ significant keywords
- Memories are always accessed together (co-access count > 5)
- Same `type` field

**Fusion process:**
1. Cortex identifies candidates
2. Uses the running LLM to generate a fused value
3. Shows before/after preview to user
4. On approval: originals → archive, fused version → active
5. Fused memory gets `confidence.source: "auto-fused"` at 0.60

**Example:**
```
FUSION CANDIDATE:
  auth-flow: "JWT with bcrypt, 7-day expiry"         (47 reads)
  login-config: "bcrypt rounds: 12, refresh tokens"    (23 reads)
  session-mgmt: "JWT in httpOnly cookie, CSRF token"   (31 reads)

PROPOSED FUSION → auth-system:
  "JWT auth: bcrypt (12 rounds), 7-day expiry,
   httpOnly cookie storage, refresh tokens, CSRF required"

  3 memories → 1 memory
  156 tokens → 68 tokens (56% reduction)
  Type: procedure | Confidence: 0.60 (auto-fused)

  Accept? [y/n]
```

### 3.3 Semantic Compression (Self-Rewriting)

Go beyond fusion. Cortex identifies memories that are poorly structured and suggests rewrites.

**Detection criteria:**
- Value length > 200 characters (potentially too verbose)
- Value contains "and" 3+ times (probably needs splitting)
- Value mixes types (fact + procedure in same memory)
- Key is vague ("misc", "notes", "stuff", "old")

**Actions:**
- **Compress:** Make verbose memories concise
- **Split:** Break one memory into typed sub-memories
- **Rename:** Suggest better key names
- **Normalize:** Reformat inconsistent values

**Example:**
```
COMPRESSION CANDIDATE:
  "deployment": "we deploy using docker and sometimes railway 
  and staging is on another branch and there was issue last 
  week with env vars"

SUGGESTED REWRITE → Split into 3:
  deployment-method (procedure): "Primary deployment uses Docker."
  deployment-staging (fact): "Staging uses a separate branch."
  deployment-incident-env-vars (error-pattern): "Recent deployment 
    failures caused by missing env vars."
```

### 3.4 Contradiction Engine

Detect internal conflicts between memories.

**Scan triggers:**
- Periodically (every 5 sessions)
- On `/nemp:cortex resolve`
- When a new memory is saved that overlaps with existing

**Detection methods:**
1. **Key family overlap:** Keys sharing word stems with different values
2. **Semantic conflict:** Values that state opposite things about same topic
3. **Scope-unaware duplication:** Same key, different implicit scope

**Conflict states per memory:**
- `none` — no conflicts detected
- `suspected` — potential conflict identified
- `confirmed` — user confirmed this is a real conflict
- `resolved` — conflict was resolved

**Conflict resolution options:**
1. Replace old value with new
2. Split by scope/environment
3. Mark one as obsolete (superseded_by)
4. Keep both with explanation
5. Ask user to resolve

**Storage:**
```json
{
  "conflicts": [
    {
      "id": "conflict-001",
      "memories": ["auth-flow", "auth-policy"],
      "description": "JWT expiry: 7 days vs 24 hours",
      "status": "suspected",
      "detected": "2026-02-26T14:00:00Z",
      "suggested_resolution": "split-by-scope",
      "resolved": null
    }
  ]
}
```

### 3.5 Reflection Engine

After every N sessions (default: 5), Cortex generates a self-assessment.

**Output: `.nemp/cortex-reflection.md`** (synced to CLAUDE.md)

```markdown
# Cortex Reflection — Feb 26, 2026

## What's Working
- auth-flow, database, framework are core memories (47, 38, 35 reads)
- Foresight accuracy: 78% (memories loaded vs memories agent referenced)
- Procedure memories have highest task success correlation

## What's Not Working
- old-todo-format: 12 Foresight loads, 0 agent references → misleading key?
- deployment: updated 5 times in 3 days → unstable, may need splitting
- 2 low-confidence memories have high usage → review urgently

## Conflicts
- JWT expiry: 7d vs 24h (suspected scope difference)

## Memory Health
- Total: 12 memories | 142 reads
- Thriving: 3 | Active: 4 | Fading: 3 | Dormant: 1 | Extinct: 1
- Token budget: ~3,200 tokens (could be 2,100 after fusion)
- 2 unverified memories | 1 conflict

## Suggested Actions
1. FUSE: auth-flow + login-config → auth-system (82% overlap)
2. ARCHIVE: legacy-api-v0 (extinct 45 days)
3. SPLIT: deployment → deployment-staging + deployment-production
4. REVIEW: old-todo-format (loaded but never referenced by agent)
5. VALIDATE: api-design (confidence decayed to 0.31)
```

### 3.6 Correction Feedback Loop

When an agent makes an error the user corrects, Cortex traces which memories were active.

**How it works:**
1. User corrects agent output → Cortex detects correction signal
2. Check: which memories were loaded for this task? (from current episode)
3. Increment `correction_events` on those memories
4. Reduce `confidence.score` by 0.15 per correction
5. If a memory reaches 3+ corrections → flag prominently

**Correction signals:**
- User says "that's wrong", "no", "incorrect", "fix this"
- User overwrites a memory value right after loading it
- User runs `/nemp:save` on a key that was just loaded with a different value

**Alert at 3+ corrections:**
```
⚠️ CORTEX ALERT: "api-design" was loaded during 3 tasks that 
   required user correction. This memory may contain outdated 
   or misleading information.
   
   Current value: "REST API at /api/v1. Auth: 3 routes."
   Confidence: 0.46 (was 0.91, reduced by corrections)
   
   Suggestion: Update with /nemp:save api-design "new value"
```

---

## TIER 4: COGNITIVE LAYER (AGI-Adjacent)

These commands make Cortex feel intelligent.

### 4.1 `/nemp:cortex` — Main Report

The evolution report combining all intelligence.

**Standard mode:** Full report (reflection + vitality + conflicts + suggestions)

**`/nemp:cortex status`** — Quick one-liner:
```
CORTEX: 12 memories | 3 thriving | 1 extinct | 2 fusions | 1 conflict | 78% accuracy | trust: 84%
```

**`/nemp:cortex --apply`** — Execute safe actions:
- Archive extinct memories
- Apply user-approved fusions
- Resolve confirmed conflicts
- Update CLAUDE.md
- Log all actions to evolution.log

**`/nemp:cortex --history`** — Evolution timeline:
```
auth-flow: created Feb 4 → updated 3x → 47 reads → thriving (94)
old-todo: created Feb 4 → 1 read → fading → archived Feb 26
auth-system: fused from auth-flow + login-config on Feb 26
```

### 4.2 `/nemp:cortex insight <task>` — Explain Memory Selection

Explain WHY memories would be loaded for a given task.

```
/nemp:cortex insight "Fix token expiry bug"

CORTEX INSIGHT:

Would load:
  ✅ auth-flow (semantic: "token", "expiry" | vitality: 94 | thriving)
  ✅ token-config (goal-linked: fix-login-bug | vitality: 78)
  ✅ session-mgmt (chain: auth-flow → session-mgmt in 6/7 sessions)
  ✅ framework (core pinned | vitality: 89)

Would skip:
  ⛔ old-auth-v0 (dormant | confidence: 0.31 | 2 correction events)
  ⛔ legacy-api-v0 (extinct | archived)

Warnings:
  ⚠️ old-auth-config has causal link to "incorrect-token-fix" errors
  ⚠️ auth-flow + old-auth-config together led to errors in 3 episodes
```

### 4.3 `/nemp:cortex resolve` — Conflict Resolution

Interactive conflict resolution.

```
/nemp:cortex resolve

2 conflicts found:

1. JWT expiry mismatch:
   auth-flow: "JWT expiry 7 days"
   auth-policy: "JWT expiry 24 hours"
   
   Suggested: Split by environment (staging vs production)
   
2. Deployment target:
   deploy-config: "Railway"
   deploy-notes: "Docker Compose on VPS"
   
   Suggested: deploy-config may be outdated (last updated 45 days ago)
   
Actions: [split] [replace] [mark-obsolete] [keep-both] [skip]
```

### 4.4 `/nemp:cortex learn` — Extract Lessons

After successful tasks, convert execution into reusable intelligence.

```
/nemp:cortex learn

Last episode: Fix login expiry bug
Outcome: success

Extracted lessons:
  💡 Token expiry config lives in auth middleware, not only .env
  💡 Refresh token path must align with cookie expiry setting
  💡 session-mgmt should be boosted for future auth debugging

Save as memories? [y/n/select]
```

Lessons are offered as new memories with:
- `type: "error-pattern"` or `type: "procedure"` depending on content
- `confidence.source: "outcome-validated"` (0.95)
- Linked to the goal that produced them

### 4.5 `/nemp:cortex simulate <task>` — Predict Needs

Simulate what a task will need BEFORE starting it.

```
/nemp:cortex simulate "Migrate auth to magic link"

CORTEX SIMULATION:

Predicted memory needs:
  📦 auth-flow (high relevance, thriving)
  📦 session-mgmt (high relevance, active)
  📦 email-provider (medium relevance, active)
  📦 user-model (medium relevance, fading)
  📦 security-policy (high relevance, active)

Missing memories (gaps):
  ❓ magic-link-token-policy — no memory on magic link token design
  ❓ email-delivery-failure-pattern — no error patterns for email

Risks:
  ⚠️ Current auth memories are JWT-centric and may bias planning
  ⚠️ auth-flow has 3 correction events — verify before relying on it
  ⚠️ Causal link: auth-flow + old-auth-config → errors (avoid co-loading)

Suggested prep:
  1. Save magic link token policy before starting
  2. Review auth-flow value for JWT-specific assumptions
  3. Check if session-mgmt needs updating for magic link flow
```

### 4.6 `/nemp:cortex trust` — Trust Dashboard

Overall reliability report.

```
CORTEX TRUST REPORT

Overall Trust Score: 76/100

By confidence:
  🟢 High (0.80+):     4 memories — auth-flow, framework, database, api-routes
  🟡 Medium (0.50-0.79): 3 memories — api-design, deployment, user-model
  🟠 Low (0.30-0.49):   3 memories — old-todo, temp-fix, legacy-note
  🔴 Unverified (<0.30): 2 memories — misc-config, old-auth-v0

Conflict-prone: 2 memories involved in active conflicts
Correction-prone: 1 memory with 3+ correction events
Stale: 3 memories not validated in 30+ days

Recommendations:
  1. Validate 3 stale memories (/nemp:cortex validate)
  2. Resolve 2 conflicts (/nemp:cortex resolve)
  3. Review old-auth-v0 (correction-prone + low confidence)
```

### 4.7 Meta-Memory (Cortex Self-Awareness)

Cortex tracks its own performance patterns:

```json
{
  "meta": {
    "foresight_accuracy_30d": 0.78,
    "avg_memories_per_task": 4.2,
    "most_useful_type": "procedure",
    "least_useful_type": "temporary",
    "overloaded_domains": ["frontend"],
    "key_patterns_low_value": ["old-*", "temp-*", "misc-*"],
    "total_fusions": 3,
    "total_archives": 7,
    "total_corrections": 5,
    "avg_confidence": 0.72
  }
}
```

Surfaces in reflection reports:
```
CORTEX META-INSIGHT:
- Procedure memories have highest task success correlation (89%)
- Temporary memories often remain active too long (avg 14 days vs intended 3)
- Keys containing "old", "temp", "misc" have 23% retrieval value vs 78% average
- Foresight overloads frontend tasks by ~22% (loads 6 memories avg vs 4 global avg)
```

### 4.8 Memory Validation Against Reality

Cortex can verify memories against the actual codebase.

**`/nemp:cortex validate`**

Checks memories against:
- `package.json` (framework, dependencies)
- `.env` / `.env.example` (environment variables)
- Config files (database, auth settings)
- Folder structure (project organization)
- Lock files (actual installed versions)
- Schema files (database schema)

```
/nemp:cortex validate

Checking 12 memories against codebase...

✅ framework: "Next.js 14" — confirmed in package.json
✅ database: "PostgreSQL" — confirmed in .env (DATABASE_URL)
⚠️ auth-flow: "bcrypt rounds: 12" — cannot verify (not in config files)
❌ api-version: "v2" — INVALIDATED: package.json shows v3.1.0
❌ deployment: "Railway" — INVALIDATED: no railway config found, 
   but found docker-compose.yml

Validated: 6 | Unverifiable: 3 | Invalidated: 2 | Skipped: 1

Actions:
  - api-version confidence reduced: 0.85 → 0.30
  - deployment flagged for review
```

Memories checked get `confidence.source` updated to `observed-from-code` or `invalidated`.

---

## FILE STRUCTURE

```
.nemp/
├── memories.json          ← enhanced with type, confidence, vitality, links
├── cortex.json            ← chains, goals, conflicts, causal links, meta
├── episodes.json          ← episodic memory (task histories)
├── archive.json           ← extinct/archived memories (recoverable)
├── cortex-reflection.md   ← latest reflection (synced to CLAUDE.md)
├── evolution.log          ← all Cortex actions with timestamps
├── access.log             ← existing (enhanced with session tracking)
├── MEMORY.md              ← existing
└── config.json            ← existing (cortex settings added)
```

### cortex.json structure:
```json
{
  "chains": [],
  "goals": [],
  "conflicts": [],
  "causal_links": [],
  "meta": {},
  "settings": {
    "reflection_interval": 5,
    "auto_archive_after_days": 7,
    "fusion_threshold": 0.75,
    "min_chain_observations": 3,
    "correction_confidence_penalty": 0.15,
    "validation_enabled": true
  }
}
```

---

## CORTEX COMMANDS SUMMARY

| Command | Description |
|---------|-------------|
| `/nemp:cortex` | Full evolution + reflection report |
| `/nemp:cortex status` | Quick one-liner status |
| `/nemp:cortex --apply` | Execute safe actions |
| `/nemp:cortex --fuse` | Show fusion candidates |
| `/nemp:cortex --chains` | Show learned access patterns |
| `/nemp:cortex --history` | Memory evolution timeline |
| `/nemp:cortex insight <task>` | Explain why memories would load |
| `/nemp:cortex resolve` | Interactive conflict resolution |
| `/nemp:cortex learn` | Extract lessons from last task |
| `/nemp:cortex simulate <task>` | Predict needs before starting |
| `/nemp:cortex trust` | Trust/reliability dashboard |
| `/nemp:cortex validate` | Check memories against codebase |
| `/nemp:cortex goal <desc>` | Create/manage active goals |

---

## INTEGRATION WITH EXISTING NEMP FEATURES

### Foresight Integration
Foresight scoring formula becomes:
```
relevance = semantic_match × 40
          + vitality_score × 20
          + goal_link_boost × 15
          + chain_prediction × 15
          + type_match × 10
          - correction_penalty × 10
          - low_confidence_penalty × 5
```

### Health Integration
`/nemp:health` adds Cortex checks:
- Is Cortex tracking enabled?
- Any extinct memories not yet archived?
- Any unresolved conflicts?
- Cortex trust score
- Episode count and lesson extraction rate

### CLAUDE.md Integration
Cortex reflection synced to CLAUDE.md:
```markdown
## Cortex Status
Trust: 76% | Memories: 12 | Thriving: 3 | Conflicts: 1
Last reflection: Feb 26, 2026
⚠️ old-auth-v0 correction-prone — avoid for auth tasks
```

### Save Integration
When `/nemp:save` runs:
1. Auto-infer type if not provided
2. Set initial confidence based on how it was created
3. Initialize vitality tracking
4. Check for contradictions with existing memories
5. Link to active goals if relevant

---

## BUILD PHASES

### Phase 1: Foundation (~3 hours)
- Enhanced memory schema (type, confidence, vitality fields)
- Auto-type inference on save
- Usage tracking hooks in all read paths
- Vitality score calculation
- `/nemp:cortex status` command
- **Deliverable:** Every memory gets classified, every read gets tracked

### Phase 2: Episodes + Decay (~2 hours)
- Episodic memory storage
- Episode lifecycle (start/track/close)
- Vitality decay engine (type-aware decay rates)
- Auto-archive extinct memories
- `/nemp:cortex --history`
- **Deliverable:** Memory lifecycle is automatic

### Phase 3: Intelligence (~3 hours)
- Fusion detection + LLM-generated fused values
- Contradiction engine (detect + track)
- Semantic compression suggestions
- `/nemp:cortex --fuse` and `/nemp:cortex resolve`
- **Deliverable:** Memory actively improves itself

### Phase 4: Prediction + Causal (~2 hours)
- Access chain detection and storage
- Foresight integration (chain prediction boost)
- Causal link extraction from episodes
- `/nemp:cortex --chains`
- **Deliverable:** Memory predicts what you need

### Phase 5: Cognitive Commands (~3 hours)
- Reflection engine + CLAUDE.md sync
- Correction feedback loop
- `/nemp:cortex insight`, `learn`, `simulate`
- **Deliverable:** Memory explains itself

### Phase 6: Validation + Trust + Meta (~2 hours)
- Codebase validation engine
- Trust dashboard
- Meta-memory tracking
- `/nemp:cortex trust` and `/nemp:cortex validate`
- Goal memory management
- Scoped contexts
- **Deliverable:** Memory verifies itself

**Total: ~15 hours across 3-4 sessions**

---

## COMPETITIVE POSITIONING

**What nobody else has:**

| Capability | Nemp Cortex | Mem0 | claude-mem | Zep | Supermemory |
|-----------|-------------|------|-----------|-----|-------------|
| Memory types | ✅ 11 types | ❌ | ❌ | ❌ | ❌ |
| Confidence scores | ✅ | ❌ | ❌ | ❌ | ❌ |
| Vitality/decay | ✅ type-aware | ❌ | ❌ | basic | ❌ |
| Contradiction detection | ✅ | ❌ | ❌ | ❌ | ❌ |
| Episodic memory | ✅ | ❌ | ❌ | ❌ | ❌ |
| Causal links | ✅ | ❌ | ❌ | ❌ | ❌ |
| Prediction chains | ✅ | ❌ | ❌ | ❌ | ❌ |
| Self-rewriting | ✅ | ❌ | ❌ | ❌ | ❌ |
| Codebase validation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Goal-linked memory | ✅ | ❌ | ❌ | ❌ | ❌ |
| Correction tracing | ✅ | ❌ | ❌ | ❌ | ❌ |
| Task simulation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Trust scoring | ✅ | ❌ | ❌ | ❌ | ❌ |
| Meta-memory | ✅ | ❌ | ❌ | ❌ | ❌ |
| 100% local | ✅ | ❌ cloud | ✅ | ❌ cloud | ❌ cloud |
| Zero ML models | ✅ | ❌ | ✅ | ❌ | ❌ |

**The pitch:**

> "Nemp Cortex is the first AI memory system that thinks. It doesn't just store — it types, scores, validates, predicts, detects contradictions, learns from mistakes, and rewrites itself to be better. All locally. No cloud. No ML. The LLM you're already running IS the brain."

> "Every other tool is a filing cabinet. Nemp is a cortex."
