# Nemp Cognitive Architecture

## Purpose

Nemp is a project-owned cognitive memory layer for AI coding agents.

The project—not the coding tool—is the durable unit of memory. Claude Code, Codex, Cursor, Windsurf, OpenClaw and future agents should read from and contribute to the same source of truth.

This document defines what Nemp means by **self-cognitive memory**, how the system should work across tools, and where current implementation ends and roadmap begins.

---

## 1. Product Definition

Nemp turns project knowledge into reusable, inspectable and adaptive context for AI agents.

A complete Nemp system should be able to:

1. capture facts, rules, procedures, decisions, warnings, preferences, goals and failure patterns;
2. preserve them between sessions and coding tools;
3. select the right subset for the current task;
4. track how agents use that memory;
5. relate memory usage to task outcomes;
6. detect stale, duplicated and contradictory knowledge;
7. improve retrieval and memory-management policies through evaluations;
8. expose the same project cognition through multiple tool adapters.

Nemp is not intended to become a hidden chatbot history database. It is intended to become **memory infrastructure for agentic software development**.

---

## 2. What “Self-Cognitive” Means

The phrase does not imply consciousness. It describes a memory system with metacognitive behaviour: it can observe, evaluate and change how it remembers.

### Self-observation

Nemp records:

- which agent created a memory;
- where the memory came from;
- when it was loaded;
- whether the agent referenced it;
- whether it was corrected;
- which task episode used it;
- whether the task succeeded or failed.

### Self-organisation

Nemp structures memories using:

- type;
- scope;
- confidence;
- vitality;
- provenance;
- goal links;
- conflict links;
- causal links;
- supersession history.

### Self-correction

Nemp should identify:

- memories that conflict with the codebase;
- multiple memories that disagree;
- memories associated with repeated failures;
- stale assumptions presented as facts;
- temporary context that should have expired;
- tool-generated changes that require human confirmation.

### Self-optimisation

Nemp should run controlled evaluations over memory policies and promote changes only when they improve measurable outcomes.

---

## 3. System Layers

```text
┌───────────────────────────────────────────────────────────────┐
│  6. AGENT AND TOOL ADAPTERS                                   │
│  Claude · Codex · Cursor · Windsurf · OpenClaw · MCP · SDK    │
├───────────────────────────────────────────────────────────────┤
│  5. CONTEXT DELIVERY                                          │
│  prompt format · token budget · scope · tool-specific export  │
├───────────────────────────────────────────────────────────────┤
│  4. FORESIGHT                                                 │
│  task intent · relevance · goals · warnings · prediction      │
├───────────────────────────────────────────────────────────────┤
│  3. CORTEX                                                    │
│  confidence · vitality · conflict · fusion · decay · episodes │
├───────────────────────────────────────────────────────────────┤
│  2. AMOS                                                      │
│  policy candidates · eval runner · scoring · promotion        │
├───────────────────────────────────────────────────────────────┤
│  1. CANONICAL PROJECT MEMORY                                  │
│  local · human-readable · portable · auditable · versionable  │
└───────────────────────────────────────────────────────────────┘
```

### Layer 1: Canonical project memory

The canonical store is the source of truth. Tool-specific files are projections of this store, not independent memories.

Recommended files:

```text
.nemp/
  memories.json
  cortex.json
  episodes.json
  chains.json
  policies.json
  access.log
  config.json
  MEMORY.md
```

### Layer 2: AMOS

AMOS stands for **Adaptive Memory Optimization System**.

AMOS manages experiments over memory policies. It should never rewrite production policy merely because one agent suggested a change. A candidate policy must be evaluated, compared against a baseline and pass regression gates.

### Layer 3: Cortex

Cortex is the memory intelligence layer. It handles memory quality and lifecycle.

### Layer 4: Foresight

Foresight converts task intention into a ranked memory set.

### Layer 5: Context delivery

The same memory may need different formatting and token budgets for different tools.

### Layer 6: Adapters

Adapters translate between Nemp’s canonical model and the integration surface a coding tool supports.

---

## 4. Canonical Memory Schema

A durable memory should support the following conceptual model:

```json
{
  "id": "mem_auth_flow",
  "key": "auth-flow",
  "value": "JWT access tokens with rotating refresh tokens",
  "type": "procedure",
  "scope": {
    "project": "current",
    "feature": "authentication",
    "paths": ["src/auth/**"]
  },
  "provenance": {
    "source": "user-confirmed",
    "agent_id": "claude-code",
    "evidence": ["src/auth/session.ts"],
    "created_at": "2026-02-26T13:00:00Z"
  },
  "confidence": {
    "score": 0.91,
    "reason": "Confirmed after implementation and tests"
  },
  "vitality": {
    "score": 84,
    "state": "thriving",
    "reads": 27,
    "references": 12,
    "last_used_at": "2026-06-24T07:30:00Z"
  },
  "links": {
    "goals": ["ship-secure-login"],
    "conflicts": [],
    "supersedes": null,
    "causal": []
  },
  "revision": 3
}
```

### Required design principles

- Every memory has provenance.
- User-confirmed knowledge outranks agent inference.
- Warnings and error patterns do not silently decay.
- Low-confidence knowledge is labelled, not presented as certainty.
- Conflicting memories coexist until resolution; one does not silently erase another.
- Tool-specific files never become the untracked source of truth.

---

## 5. Memory Types

| Type | Purpose | Typical lifecycle |
|---|---|---|
| `fact` | Stable project truth | Slow decay, code validation |
| `rule` | Constraint the agent must follow | Protected |
| `preference` | Style or team choice | Slow decay |
| `procedure` | Repeatable method | Outcome validated |
| `decision` | Choice plus rationale | Superseded, not deleted |
| `assumption` | Belief requiring validation | Faster decay |
| `temporary` | Short-lived working context | Fast decay |
| `goal` | Active objective | No decay while active |
| `warning` | Risk or forbidden behaviour | Protected |
| `error-pattern` | Known failure mode | Protected and task boosted |
| `hypothesis` | Experimental belief | Fast decay and explicit uncertainty |

---

## 6. Episodic Memory

Semantic memory says what the project knows. Episodic memory says what happened during a task.

Example:

```json
{
  "episode_id": "ep_2026_06_24_001",
  "task": "Fix refresh-token rotation",
  "agent": "codex",
  "memories_loaded": ["auth-flow", "auth-warning"],
  "memories_referenced": ["auth-flow", "auth-warning"],
  "actions": ["read", "edit", "test"],
  "outcome": "success",
  "tests_passed": true,
  "human_corrections": 0,
  "lessons": ["Rotation must invalidate the previous token family"]
}
```

Episodes provide the evidence required for Nemp to learn which memories help under which conditions.

---

## 7. Causal Learning

Nemp should not assume that a loaded memory caused success. It should accumulate evidence across episodes.

Possible causal relations:

- `memory-led-to-success`
- `memory-led-to-error`
- `memory-combination-success`
- `memory-combination-risk`
- `missing-memory-caused-rework`
- `stale-memory-caused-regression`

Causal links should include:

- evidence count;
- confidence;
- episode references;
- task type;
- affected tools;
- last validation date.

---

## 8. Foresight Retrieval

Foresight should rank memories using more than keyword similarity.

A conceptual score:

```text
relevance =
  semantic_match
  + active_goal_boost
  + warning_boost
  + error_pattern_boost
  + path_scope_match
  + successful_outcome_history
  + tool_compatibility
  + recency_weight
  + user_confirmed_weight
  - stale_penalty
  - conflict_penalty
  - token_cost_penalty
```

Retrieval output should include an explanation:

```text
Loaded auth-warning because:
- task concerns token storage;
- warning type is protected;
- referenced in 4 successful auth episodes;
- applies to src/auth/**;
- user-confirmed confidence: 0.94.
```

Inspectability is essential. Users should be able to understand why memory entered the context.

---

## 9. Cortex Lifecycle

A memory can move through states:

```text
candidate → active → thriving → fading → dormant → archived
                    ↘ conflicting
                    ↘ superseded
                    ↘ quarantined
```

### Candidate

Generated or imported but not yet trusted.

### Active

Usable memory with sufficient confidence.

### Thriving

Frequently useful and supported by successful outcomes.

### Fading

Usage or validation has declined.

### Dormant

Excluded from normal retrieval but still recoverable.

### Conflicting

Disagrees with another memory or current code evidence.

### Superseded

Replaced by a newer decision while preserving history.

### Quarantined

Associated with repeated failures or unsafe behaviour; requires review.

---

## 10. AMOS: Adaptive Memory Optimization System

AMOS is the mechanism that makes Nemp self-optimising rather than merely rule-based.

### Experiment loop

```text
1. Select baseline memory policy
2. Generate one or more candidate policies
3. Run the same task set with each policy
4. Measure quality, cost and regressions
5. Compare against baseline
6. Promote only statistically and practically better policies
7. Preserve rollback data
8. Continue learning from production episodes
```

### Policy dimensions

AMOS can vary:

- retrieval top-k;
- score thresholds;
- type boosts;
- active-goal weighting;
- warning inclusion rules;
- confidence thresholds;
- decay rates;
- fusion thresholds;
- contradiction penalties;
- token budgets;
- tool-specific formatting;
- summarisation strategy;
- episodic versus semantic memory mix.

### Evaluation metrics

- task success;
- first-pass success;
- regression rate;
- test/build pass rate;
- tool-call accuracy;
- diff relevance;
- context drift;
- repeated instruction count;
- rework prompts;
- human intervention;
- memory precision;
- memory recall;
- token usage;
- latency;
- cross-tool continuation success.

### Promotion gates

A candidate policy should not be promoted unless it:

- improves the primary task metric;
- does not exceed regression limits;
- does not meaningfully increase unsafe behaviour;
- stays within cost and latency budgets;
- can be rolled back;
- produces reproducible results.

---

## 11. Cross-Tool Adapter Contract

Every adapter should implement the same conceptual operations:

```text
capabilities()
export(memory_set, target_format)
import(target_artifact)
detect_changes()
resolve_conflicts()
validate_output()
status()
```

### Adapter responsibilities

- map canonical memory types to target-tool instructions;
- preserve provenance where possible;
- respect target token or file limits;
- avoid overwriting user-authored instructions;
- mark generated sections clearly;
- detect external edits;
- return changes to the canonical store through reviewable import;
- expose adapter health.

### Initial adapters

| Tool | Integration surface |
|---|---|
| Claude Code | `CLAUDE.md`, plugin commands and hooks |
| Codex CLI | `AGENTS.md` |
| Cursor | `.cursor/rules/*.mdc` |
| Windsurf | `.windsurfrules` |
| OpenClaw | `SKILL.md` / AgentSkills |
| General agents | MCP server and SDK roadmap |

---

## 12. Conflict Resolution

Cross-tool memory requires explicit conflict semantics.

Example:

```text
Canonical memory: Use Prisma
Cursor rule edit: Use Drizzle
Code evidence: drizzle.config.ts exists
```

Nemp should not silently select one.

A conflict record should include:

- values in conflict;
- sources;
- confidence scores;
- file evidence;
- timestamps;
- agents involved;
- suggested resolution;
- human decision when required.

Suggested resolution order:

1. verified current code evidence;
2. explicit user confirmation;
3. successful recent task outcomes;
4. newer agent-generated inference;
5. older unverified memory.

Protected rules and warnings require human approval before replacement.

---

## 13. Security and Privacy Boundaries

Nemp must treat project memory as potentially sensitive.

### Default rules

- Store locally by default.
- Never capture secrets intentionally.
- Add secret-pattern filtering before save, export and logging.
- Redact environment-variable values.
- Keep audit logs local.
- Make deletion and export explicit.
- Allow path and memory scopes.
- Do not send project memory to an external model unless the user configured that behaviour.

### Threats to test

- prompt injection stored as memory;
- malicious instructions imported from another tool;
- secrets captured from configuration files;
- stale security rules overriding current policy;
- untrusted agent overwriting protected memory;
- poisoned episodic outcomes;
- adapter-generated instruction loops.

---

## 14. Human Control

Self-cognitive does not mean autonomous and unaccountable.

Users need:

- memory inspection;
- provenance views;
- confidence explanations;
- approval for sensitive corrections;
- protected memory;
- time travel and rollback;
- policy experiment history;
- adapter status;
- conflict review;
- complete deletion.

Nemp should automate low-risk memory maintenance while keeping consequential changes reviewable.

---

## 15. Implementation Sequence

### Milestone A: Canonical model and adapters

- stabilise memory schema;
- define adapter interface;
- normalise current Claude, Codex, Cursor, Windsurf and OpenClaw integrations;
- add import/export contract tests;
- add provenance and conflict records.

### Milestone B: Episodes and outcomes

- create task episodes;
- record loaded and referenced memories;
- capture tests, corrections and outcomes;
- add episode inspection commands.

### Milestone C: Cognitive lifecycle

- implement confidence and vitality consistently;
- add protected memory;
- complete fusion, contradiction, supersession and quarantine;
- make health diagnostics explainable.

### Milestone D: AMOS evaluations

- define baseline task suites;
- support memory-on versus memory-off runs;
- compare policy candidates;
- add promotion and rollback;
- publish repeatable benchmark reports.

### Milestone E: Universal access

- ship MCP server;
- add SDK or local API;
- add adapters based on user demand;
- support project, team and organisation scopes without tool lock-in.

---

## 16. Non-Goals

Nemp should not become:

- a generic vector database with a memory label;
- a cloud-only conversation-history product;
- an opaque auto-learning system users cannot inspect;
- a separate memory database for every coding tool;
- a system that saves everything indiscriminately;
- a claim of artificial consciousness;
- a replacement for source control, tests or project documentation.

Nemp complements these systems by making their knowledge useful to agents at the right moment.

---

## 17. Definition of Success

Nemp succeeds when a developer can:

1. begin work in Claude Code;
2. continue in Codex or Cursor;
3. return through another agent;
4. avoid restating project context;
5. preserve decisions and warnings;
6. reduce rework and regressions;
7. inspect exactly what the memory system learned;
8. see the memory system improve through evidence rather than marketing claims.

The final product promise is:

> **The coding tool can change. The project still remembers.**
