---
description: "Predict and return only memories relevant to your prompt"
argument-hint: "<prompt> [--top <n>] [--threshold <0.0-1.0>]"
---

# /nemp:foresight

Score every memory against your prompt's intent and return only the ones that matter — instead of dumping all memories or making the agent guess.

## Usage
```
/nemp:foresight "I need to add Google OAuth login"
/nemp:foresight "fix the database migration error" --top 5
/nemp:foresight "build the checkout flow" --threshold 0.3
/nemp:foresight "continue where we left off"
```

## Instructions

### Step 1: Parse Arguments

Extract from the command input:
- `PROMPT` — everything before any `--` flags (required)
- `--top N` — override the auto top_k with N (optional)
- `--threshold F` — minimum score to include a memory, default `0.15` (optional)

If no prompt is provided, show help and stop:
```
Nemp Foresight

Usage: /nemp:foresight "<prompt>" [--top <n>] [--threshold <0-1>]

Scores your memories against the prompt intent and returns only
the relevant subset — with token savings stats.

Examples:
  /nemp:foresight "add Google OAuth login"
  /nemp:foresight "fix the DB migration" --top 5
  /nemp:foresight "continue styling the dashboard" --threshold 0.2

Options:
  --top N          Return at most N memories (default: auto from intent)
  --threshold F    Minimum relevance score 0.0–1.0 (default: 0.15)

How scoring works:
  Domain match   0.00 – 0.40   (does the memory relate to detected domains?)
  Keyword match  0.00 – 0.30   (do prompt words appear in the memory?)
  Key match      0.00 – 0.20   (does the memory key appear in the prompt?)
  Recency        0.00 – 0.05   (newer memories score slightly higher)
  Core key floor 0.30 always   (stack, framework, etc. always included)
```

### Step 2: Read Memories

Use the Read tool to load:
- Project memories: `.nemp/memories.json`
- Global memories:  `~/.nemp/memories.json`

If a file doesn't exist, treat it as an empty list. If both are missing, show:
```
No memories found. Run /nemp:init to detect your project stack.
```

Merge project and global memories into one flat list. Tag each with its `scope`
(`"project"` or `"global"`) for display.

Each memory object has the shape:
```json
{
  "key": "auth-provider",
  "value": "NextAuth.js with Google + GitHub OAuth",
  "tags": ["auth", "auto-detected"],
  "updated": "2026-02-11T14:00:00Z",
  "scope": "project"
}
```

### Step 3: Auto top_k — Detect Intent Level

Lowercase the prompt and scan for action verbs to determine how many memories to return when `--top` is not set:

```
HIGH-INTENT words (top_k = 12):
  add, build, create, implement, write, fix, setup, configure,
  integrate, install, generate, design, develop, connect, enable

MEDIUM-INTENT words (top_k = 8):
  update, change, modify, refactor, improve, edit, migrate,
  move, rename, replace, extend, debug, test

CONTINUATION (top_k = 20):
  continue, where, left off, next, proceed, pick up, resume,
  what, were, was, doing, go back, still working

LOW / OTHER (top_k = 5):
  anything else that doesn't match above
```

Logic:
```
If --top was passed explicitly → use that number as top_k
Else if any HIGH-INTENT word found in prompt → top_k = 12
Else if any MEDIUM-INTENT word found → top_k = 8
Else if any CONTINUATION word found  → top_k = 20
Else                                  → top_k = 5
```

### Step 4: Domain Detection

Lowercase the prompt. For each domain below, count how many signal words
appear in the prompt. Score = `matched_signals / total_signals_in_domain`.
A domain is "active" if its score > 0.

**Domain Signal Word Table:**

```
auth:
  login, logout, session, token, jwt, oauth, password, cookie,
  authenticate, credentials, signin, signup, google, github,
  magic-link, mfa, 2fa, refresh, bearer, authorize
  (20 signals)

database:
  database, db, sql, query, schema, migration, table, model,
  orm, postgres, mysql, sqlite, mongo, prisma, drizzle,
  insert, select, update, delete, relation, foreign
  (21 signals)

api:
  api, endpoint, route, rest, graphql, fetch, request, response,
  http, webhook, cors, middleware, handler, trpc, axios,
  payload, header, status, json, xml
  (20 signals)

frontend:
  component, react, vue, svelte, render, props, hook, ui,
  dom, browser, client, page, layout, template, hydrate,
  island, server-component, suspense, loading, error
  (20 signals)

backend:
  server, express, fastify, node, handler, controller,
  service, function, lambda, worker, cron, job, queue,
  task, background, process, runtime
  (17 signals)

testing:
  test, spec, mock, assertion, coverage, unit, integration,
  e2e, describe, jest, vitest, playwright, cypress, stub,
  snapshot, fixture, fake, spy, expect
  (19 signals)

deployment:
  deploy, docker, container, vercel, netlify, aws, ci, cd,
  pipeline, build, release, environment, production, staging,
  k8s, kubernetes, helm, nginx, proxy
  (19 signals)

payment:
  payment, stripe, invoice, checkout, billing, subscription,
  plan, price, charge, refund, webhook, transaction,
  currency, amount, receipt
  (15 signals)

design:
  style, css, tailwind, theme, color, layout, responsive,
  mobile, ui, design, figma, spacing, font, animation,
  transition, dark-mode, icon, breakpoint
  (18 signals)

state:
  state, store, redux, zustand, jotai, context, reducer,
  action, selector, atom, signal, reactive, observable,
  persist, hydrate, sync
  (16 signals)

security:
  xss, csrf, injection, sanitize, validate, hash, encrypt,
  permission, secure, role, access, vulnerability, rate-limit,
  escape, headers, csp, cors, audit
  (18 signals)

architecture:
  architecture, pattern, structure, refactor, module, layer,
  service, repository, dependency, abstraction, interface,
  separation, concern, solid, design-pattern
  (15 signals)

feature:
  feature, flow, screen, form, button, modal, list, detail,
  dashboard, widget, panel, table, card, sidebar, nav,
  header, footer, menu, toast, notification
  (20 signals)
```

### Step 5: Score Each Memory

For every memory in the merged list, compute a relevance score 0.0–1.0:

```
════════════════════════════════════════════════════
A. DOMAIN SCORE  (max 0.40)
════════════════════════════════════════════════════

  active_domains = domains where score > 0 (from Step 4)
  if no active_domains → domain_score = 0.0

  For each active domain D:
    domain_strength = D.score   (the 0.0–1.0 score from Step 4)
    weight = domain_strength × 0.40 / count(active_domains)

    Combine the memory's key + value + tags into one string (lowercase)
    If any of D's signal words appear in that combined string:
      domain_score += weight

════════════════════════════════════════════════════
B. KEYWORD SCORE  (max 0.30)
════════════════════════════════════════════════════

  STOP WORDS (skip these):
    a, an, the, i, to, in, on, at, is, it, be, do, my,
    of, or, and, but, not, no, for, we, need, this, that,
    with, have, get, can, will, please, how, why, what

  prompt_tokens = lowercase prompt words NOT in stop words

  Match count = number of prompt_tokens where the token appears
                in the memory's key OR value (substring match)

  keyword_score = min(0.30, match_count × 0.10)

════════════════════════════════════════════════════
C. KEY NAME SCORE  (max 0.20)
════════════════════════════════════════════════════

  key_tokens = split memory key on "-" and "_" → individual words
  prompt_token_set = set of all prompt_tokens from section B

  matches = count of key_tokens that appear in prompt_token_set

  key_name_score = min(0.20, matches × 0.10)

════════════════════════════════════════════════════
D. RECENCY SCORE  (max 0.05)
════════════════════════════════════════════════════

  If memory has an "updated" ISO-8601 timestamp:
    days_old = days between updated date and today
    recency_score = max(0.0,  0.05 - (days_old / 365) × 0.05)
  Else:
    recency_score = 0.0

════════════════════════════════════════════════════
TOTAL = domain_score + keyword_score + key_name_score + recency_score

CORE KEY FLOOR:
  CORE_KEYS = [framework, language, stack, project-name,
               project-type, database, auth-provider,
               package-manager, project-description]

  if memory.key in CORE_KEYS:
    total = max(total, 0.30)
════════════════════════════════════════════════════
```

#### Step 5b: Apply Cortex Modifiers

**Backward compatibility:** If any memory lacks cortex fields, initialize with defaults before scoring:
- `type`: `"fact"`
- `confidence`: `{"score": 0.65, "source": "agent-inferred", "reason": "Pre-cortex memory"}`
- `vitality`: all counters set to 0, `score`: 50, `state`: "active", `trend`: "stable", `last_read`: null, `decay_rate`: 0.01
- `links`: `{"goals": [], "conflicts": [], "supersedes": null, "superseded_by": null, "causal": []}`

After computing the base total score from Step 5, apply these Cortex modifiers:

```
CORTEX MODIFIERS (applied to existing total score):

1. Vitality state multiplier:
   - If vitality.state == "thriving": score = score × 1.25
   - If vitality.state == "dormant":  score = score × 0.5
   - If vitality.state == "extinct":  score = 0 (exclude entirely)

2. Type-based floor (always include important types):
   - If memory type == "goal":    score = max(score, 0.40)
   - If memory type == "warning": score = max(score, 0.35)

3. Conflict tagging:
   - If links.conflicts array is non-empty: tag memory with "⚠️ conflict" for display

4. Chain prediction boost:
   - If .nemp/cortex.json exists AND the current session's accessed memories
     match the start of a known chain in cortex.json, boost the predicted
     next memory in the chain by +0.15
```

### Step 6: Filter and Sort

```
1. Sort all memories by total score (descending)
2. Skip memories where vitality.state == "extinct" (score already set to 0)
3. Remove memories where total < threshold  (default 0.15)
4. Take the first top_k memories from the filtered list
```

### Step 7: Display Results

**When memories are selected:**

```
Foresight: "I need to add Google OAuth login"

Detected intents: auth (high), backend (low)
Auto top_k: 12  ·  Threshold: 0.15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RELEVANT MEMORIES  (4 of 11)

  auth-provider [0.85] ← thriving
  ──────────────────────────────────────────────────
  NextAuth.js with Google + GitHub OAuth providers

  framework [0.30] ← active · core key
  ──────────────────────────────────────────────────
  Next.js 14 + TypeScript

  stack [0.30] ← active · core key
  ──────────────────────────────────────────────────
  Next.js 14 + React 19 + Prisma + PostgreSQL

  old-config [0.20] ← fading ⚠️ conflict
  ──────────────────────────────────────────────────
  Legacy config value

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stats: 11 total → 4 selected · 64% token savings

Quick actions:
  /nemp:recall auth-provider      View full memory
  /nemp:context auth              Keyword search
  /nemp:foresight "..." --top 8   Adjust result count
```

**Score label format:**
- Score shown as `[0.85]` next to the key
- Append `← <vitality-state>` after the score (e.g., `← thriving`, `← active`, `← fading`)
- Append `· core key` if the memory was boosted by the core key floor
- Append `⚠️ conflict` if links.conflicts is non-empty
- Append `[global]` after the key name for memories from `~/.nemp/memories.json`

**Token savings:**
```
token_savings_pct = round((1 - selected / total) × 100)
```

Display as: `N total → M selected · X% token savings`

**When nothing passes the threshold:**

```
Foresight: "build a hello world page"

Detected intents: frontend (low)
No memories scored above 0.15 for this prompt.

All 3 stored memories:
  project-name    0.30  ← core key (always included at 0.30+)
  stack           0.30  ← core key
  framework       0.30  ← core key

Try:
  /nemp:list                  See all memory keys
  /nemp:foresight "..." --threshold 0.05
                              Lower the threshold
  /nemp:context frontend      Keyword search
```

Note: If core keys exist, they will always appear even in the "nothing passes"
case because their floor is 0.30 > default threshold 0.15.

**When memories are completely empty:**

```
Foresight: "build a checkout flow"

No memories found. Run /nemp:init to detect your project stack.

  /nemp:init                  Auto-detect project and save context
  /nemp:save <key> <value>    Save your first memory manually
```

### Step 8: Log the Operation

Append one line to `.nemp/access.log`:

```
[ISO-8601] FORESIGHT agent=main prompt="<first 50 chars of prompt>" selected=<n> total=<n> top_k=<n> threshold=<f>
```

Example:
```
[2026-02-17T09:32:11Z] FORESIGHT agent=main prompt="I need to add Google OAuth login" selected=4 total=11 top_k=12 threshold=0.15
```

Truncate the prompt to 50 characters in the log. Use `agent=main` unless a
different `agent_id` is available from context.

### Step 8b: Update Vitality Counters

After displaying results and logging, update memories.json with vitality changes:

**For each SELECTED memory (displayed to the user):**
```
vitality.reads += 1
vitality.reads_7d += 1
vitality.reads_30d += 1
vitality.last_read = <current ISO-8601 timestamp>
vitality.foresight_loads += 1
```

**For each memory that was available but NOT selected (scored below threshold or beyond top_k):**
```
vitality.foresight_skips += 1
```

**Recalculate vitality scores** for all affected memories using the formula:
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

Update `vitality.state` based on new score:
- 80-100: `"thriving"`
- 50-79: `"active"`
- 20-49: `"fading"`
- 1-19: `"dormant"`
- 0: `"extinct"`

Write ALL changes back to memories.json in **one write operation**.

### Step 8c: Start Episode

After loading memories for a task, create or update an episode in `.nemp/episodes.json`:

1. If `.nemp/episodes.json` does not exist, create it with `{"episodes": []}` first.
2. Generate an episode ID: `ep-<YYYY-MM-DD>-<NNN>` where NNN is a zero-padded sequence number for episodes created today (e.g., `ep-2026-02-26-001`).
3. Create the episode entry:
```json
{
  "episode_id": "ep-<YYYY-MM-DD>-<NNN>",
  "timestamp": "<current ISO-8601>",
  "goal": "<first 80 chars of foresight prompt>",
  "memories_loaded": ["<key1>", "<key2>"],
  "memories_referenced": [],
  "actions_taken": [],
  "outcome": "unknown",
  "correction_applied": false
}
```
4. Append this episode to the `episodes` array.
5. If the array exceeds 100 episodes, drop the oldest entries to keep max 100.
6. Write the updated episodes.json back.

---

## Scoring Reference Card

| Component | Max | When it fires |
|-----------|-----|---------------|
| Domain match | 0.40 | Memory contains domain signal words that also appear in prompt |
| Keyword match | 0.30 | Prompt tokens (no stopwords) appear in memory key or value |
| Key name match | 0.20 | Memory key parts (split on -/_) appear in prompt |
| Recency | 0.05 | Memory was updated recently (within the past year) |
| Core key floor | 0.30 min | Key is a fundamental context key (stack, framework, etc.) |

**Threshold guide:**
| Value | Effect |
|-------|--------|
| 0.05 | Very permissive — returns almost everything |
| 0.15 | Default — balanced relevance |
| 0.30 | Strict — only strong matches + core keys |
| 0.50+ | Very strict — only highly relevant memories |

---

## Related Commands
- `/nemp:context <keyword>` — Keyword expansion search (use when you know the domain)
- `/nemp:recall <key>` — View a specific memory in full
- `/nemp:list` — See all memory keys
- `/nemp:suggest` — Analyze recent activity and suggest new memories to save
