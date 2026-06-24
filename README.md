<div align="center">

  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td><img src="assets/logo/Nemp Logo.png" alt="Nemp Memory Logo" height="80"/></td>
      <td><h1>&nbsp;Nemp Memory</h1></td>
    </tr>
  </table>

  <p><strong>The self-cognitive project memory for AI coding agents.</strong></p>
  <p>Your project remembers, learns and carries its context across tools.</p>

  <p>
    <img src="https://img.shields.io/badge/version-0.3.0-blue.svg" alt="Version 0.3.0">
    <img src="https://img.shields.io/badge/local--first-yes-brightgreen.svg" alt="Local first">
    <img src="https://img.shields.io/badge/cloud-required%3F-no-blue.svg" alt="No cloud required">
    <img src="https://img.shields.io/badge/API_key-required%3F-no-blue.svg" alt="No API key required">
    <img src="https://img.shields.io/badge/privacy-project_owned-purple.svg" alt="Project-owned memory">
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License"></a>
  </p>

  <img src="assets/images/Nemp banner 2.png" alt="Nemp Memory Banner" width="100%"/>

</div>

---

## What Nemp Is Becoming

Nemp is not just a plugin that saves notes between Claude Code sessions.

Nemp is a **tool-agnostic cognitive memory layer for AI-native software development**. The memory belongs to the project—not to Claude, Cursor, Codex, Windsurf or any other coding tool.

```text
                         ┌──────────────────────┐
Claude Code ────────────▶│                      │
Codex CLI ──────────────▶│                      │
Cursor ─────────────────▶│   NEMP PROJECT       │
Windsurf ───────────────▶│   COGNITIVE MEMORY   │
OpenClaw ───────────────▶│                      │
Future coding agents ───▶│                      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                      Decisions · Rules · Goals
                      Failures · Procedures · Context
                      Confidence · Usage · Outcomes
```

The long-term goal is simple:

> **Every coding agent should continue from what the project already knows instead of starting from zero.**

---

## The Problem

AI coding tools are individually intelligent but collectively forgetful.

When you move from one tool or session to another, you repeatedly explain:

- the product goal and current milestone;
- the stack, architecture and project structure;
- decisions already made and why they were made;
- known bugs, failed approaches and safety constraints;
- coding conventions and team preferences;
- what was completed, what changed and what should happen next.

Most existing memory systems behave like storage: save something, retrieve it later.

Nemp is designed to move beyond storage toward **project cognition**:

1. remember useful context;
2. load only what the current task needs;
3. track whether memories helped or caused mistakes;
4. identify stale, conflicting or duplicated memories;
5. improve how the project remembers over time;
6. make the improved memory available to every coding agent.

---

## What “Self-Cognitive Memory” Means

Nemp is not claiming consciousness or human self-awareness. In Nemp, **self-cognitive** means the memory system can inspect and improve its own memory behaviour.

| Capability | What it means |
|---|---|
| **Self-observing** | Tracks which memories are created, loaded, referenced, corrected and ignored. |
| **Self-organising** | Classifies memories as facts, rules, procedures, decisions, warnings, goals and temporary context. |
| **Self-correcting** | Detects contradictions, stale information and memories that repeatedly contribute to bad outcomes. |
| **Self-prioritising** | Uses confidence, recency, vitality, task relevance and active goals to decide what should enter context. |
| **Self-compressing** | Merges duplication and rewrites verbose memories into smaller, more useful forms. |
| **Self-evaluating** | Measures whether a memory policy improves task success, context quality and token efficiency. |
| **Self-optimising** | Evolves retrieval, decay, fusion and context-loading policies through repeatable evaluations. |

This intelligence layer is called **Nemp Cortex**. The policy-optimisation direction is called **AMOS — Adaptive Memory Optimization System**.

---

## One Project Memory, Many Coding Tools

Nemp keeps a canonical, project-owned memory store and translates it into the formats different agents understand.

```text
.nemp/memories.json              ← canonical project memory
.nemp/cortex.json                ← goals, health and cognitive metadata
.nemp/episodes.json              ← task outcomes and lessons
.nemp/access.log                 ← memory usage and audit trail

CLAUDE.md                        ← Claude Code adapter
AGENTS.md                        ← Codex adapter
.cursor/rules/nemp-memory.mdc    ← Cursor adapter
.windsurfrules                   ← Windsurf adapter
SKILL.md                         ← AgentSkills / OpenClaw adapter
MCP tools                        ← broader agent integration (roadmap)
```

### Current first-class targets

- Claude Code
- Codex CLI
- Cursor
- Windsurf
- OpenClaw and AgentSkills-compatible agents

### Universal direction

Nemp is designed for any coding agent that can use one of these integration methods:

- project instruction files;
- AgentSkills;
- command or CLI adapters;
- MCP tools;
- local file read/write access;
- API or SDK adapters.

“Works across all coding tools” is the architectural goal. Today, the repository has direct adapters for the tools listed above; additional tools will be added through a common adapter contract rather than separate memory silos.

---

## Core Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  TOOL ADAPTERS                                              │
│  Claude · Codex · Cursor · Windsurf · OpenClaw · MCP        │
├─────────────────────────────────────────────────────────────┤
│  CONTEXT ORCHESTRATION                                      │
│  Foresight · scope · token budget · active-goal loading     │
├─────────────────────────────────────────────────────────────┤
│  COGNITIVE INTELLIGENCE — NEMP CORTEX                       │
│  confidence · vitality · conflict · fusion · decay · goals  │
│  episodes · causal links · reflection · correction          │
├─────────────────────────────────────────────────────────────┤
│  ADAPTIVE OPTIMISATION — AMOS                               │
│  memory-policy experiments · evals · promotion · rollback   │
├─────────────────────────────────────────────────────────────┤
│  PROJECT-OWNED MEMORY                                       │
│  local JSON · inspectable · portable · versionable          │
└─────────────────────────────────────────────────────────────┘
```

### 1. Project-owned memory

Memory lives with the project in human-readable files. It can be inspected, versioned, backed up, moved and deleted by the user.

### 2. Foresight

Foresight predicts which memories are relevant to the current task and avoids dumping the entire memory store into the prompt.

```bash
/nemp:foresight "fix the login token expiry bug"
```

### 3. Cortex

Cortex converts passive memories into a living memory system through:

- memory typing;
- confidence and vitality scoring;
- active goals;
- contradiction detection;
- memory fusion;
- decay and recoverable archiving;
- task episodes and outcome tracking;
- reflection and correction.

```bash
/nemp:cortex
/nemp:decay
/nemp:health
```

### 4. AMOS

AMOS is the self-optimisation loop. It will evaluate competing memory policies using real coding-agent tasks and promote policies that measurably improve results.

Example policies AMOS can test:

- how many memories should be loaded;
- which memory types deserve a boost;
- when a memory should decay;
- when two memories should fuse;
- how much recent usage should influence retrieval;
- when low-confidence memories should be shown as warnings;
- which context format works best for a specific coding agent.

---

## Current Capability Map

This table separates what is present now from the broader product direction.

| Capability | Status |
|---|---|
| Persistent project and global memory | Available |
| Auto-detect project stack | Available |
| Smart context search | Available |
| Agent attribution and access logs | Available |
| CLAUDE.md generation and sync | Available |
| Foresight task-based context selection | Available |
| Memory health diagnostics | Available |
| Cortex command and cognitive specification | Available / evolving |
| Confidence, vitality, fusion, conflict and decay model | Available / evolving |
| Codex, Cursor and Windsurf export | Available |
| Cross-provider import with conflict handling | Pro |
| Automatic cross-provider export | Pro |
| Episodic outcome learning | Roadmap |
| Causal memory-to-outcome learning | Roadmap |
| AMOS policy evaluation and optimisation | Roadmap |
| Standard MCP memory server | Roadmap |
| Additional coding-tool adapters | Roadmap |

---

## Installation

### Claude Code plugin

```bash
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
```

Restart Claude Code after installation, then initialise memory inside a project:

```bash
/nemp:init
```

Verify:

```bash
/nemp:list
```

### Manual installation

```bash
cd ~/.claude/plugins/marketplaces
git clone https://github.com/SukinShetty/Nemp-memory.git nemp-memory
```

Restart Claude Code and run:

```bash
/plugin install nemp
```

### OpenClaw / AgentSkills

```bash
git clone https://github.com/SukinShetty/Nemp-memory.git \
  <your-openclaw-workspace>/skills/nemp-memory
```

Nemp includes `SKILL.md`, allowing AgentSkills-compatible agents to discover the project memory skill.

---

## Essential Commands

```bash
# Learn the project
/nemp:init

# Save, recall and manage memory
/nemp:save <key> <value>
/nemp:recall <key>
/nemp:context <query>
/nemp:list
/nemp:forget <key>

# Predictively load context
/nemp:foresight "<task or intention>"

# Inspect and improve memory quality
/nemp:health
/nemp:cortex
/nemp:decay

# Audit memory usage
/nemp:log
/nemp:activity

# Claude Code synchronisation
/nemp:auto-sync on
/nemp:sync
/nemp:export

# Cross-tool memory
/nemp-pro:export --codex
/nemp-pro:export --cursor
/nemp-pro:export --windsurf
/nemp-pro:export --all
/nemp:import
/nemp:auto-export on
```

> Command availability depends on the installed Nemp edition. Pro commands remain locked until activation.

---

## Example: A Project Remembers Across Tools

### In Claude Code

```bash
/nemp:save auth-decision "Use short-lived JWT access tokens with rotating refresh tokens"
/nemp:save auth-warning "Never store access tokens in localStorage" --type warning
/nemp-pro:export --all
```

### In Codex

Codex reads the generated `AGENTS.md` and receives the same decisions and warnings.

### In Cursor

Cursor reads `.cursor/rules/nemp-memory.mdc` and continues using the same project rules.

### Back in Claude Code

```bash
/nemp:import
/nemp:health
```

Nemp brings changes back into the canonical store, checks conflicts and reports memory health.

The agent changed. The project memory did not disappear.

---

## Memory Data Model

A Cortex-enhanced memory can contain more than a key and value:

```json
{
  "key": "auth-flow",
  "value": "JWT auth with rotating refresh tokens",
  "type": "procedure",
  "agent_id": "claude-code",
  "confidence": {
    "score": 0.91,
    "source": "user-confirmed"
  },
  "vitality": {
    "score": 84,
    "state": "thriving",
    "reads": 27,
    "agent_references": 12
  },
  "links": {
    "goals": ["ship-secure-login"],
    "conflicts": [],
    "causal": []
  }
}
```

Memory types include:

- `fact`
- `rule`
- `preference`
- `procedure`
- `decision`
- `assumption`
- `temporary`
- `goal`
- `warning`
- `error-pattern`
- `hypothesis`

---

## Evaluation: How Nemp Should Prove It Works

Nemp should not be judged only by how many memories it stores. It should be judged by whether agents build better software with it.

Core evaluation metrics include:

| Metric | Question |
|---|---|
| Task success | Did the coding agent complete the requested task correctly? |
| First-pass success | Did it work without repeated correction prompts? |
| Context drift | Did the agent forget or violate prior project decisions? |
| Regression rate | Did the change break existing functionality? |
| Rework | How many prompts or code revisions were required? |
| Human intervention | How often did a person need to restate context? |
| Memory precision | How much loaded memory was actually useful? |
| Memory recall | Were important memories missing? |
| Token efficiency | Did Nemp improve outcomes without bloating context? |
| Cross-tool continuity | Could another agent continue without re-onboarding? |

AMOS will use these measurements to compare memory policies rather than relying on intuition.

---

## Privacy and Ownership

Nemp is local-first and project-owned.

```text
.nemp/
  memories.json
  cortex.json
  episodes.json
  access.log
  config.json
  MEMORY.md
```

- No cloud account is required for the open-source memory layer.
- No model API key is required for core file-based memory operations.
- Memory remains inspectable instead of being hidden inside a proprietary agent account.
- Users can back up, version or delete their memory files.

```bash
rm -rf .nemp
```

Because the memory travels with the project, switching coding tools does not mean surrendering project knowledge to a new platform.

---

## Product Principles

1. **The project owns the memory.**
2. **Memory must work across agents.**
3. **Useful context matters more than maximum context.**
4. **Every memory needs provenance and confidence.**
5. **Contradictions must be visible, not silently overwritten.**
6. **Memory improvement must be measured through evaluations.**
7. **Local-first should remain the default.**
8. **A human must be able to inspect, correct and roll back memory.**

---

## Roadmap

### Phase 1 — Universal project memory

- stabilise Claude Code, Codex, Cursor, Windsurf and OpenClaw adapters;
- define a common adapter interface;
- make import/export status visible;
- add deterministic conflict handling and provenance.

### Phase 2 — Cognitive memory

- complete episodic memory and outcome capture;
- connect memories to goals and task results;
- strengthen contradiction, fusion, correction and decay;
- add inspectable memory graphs and scoped feature memory.

### Phase 3 — Self-optimising memory

- build AMOS evaluation datasets and task runners;
- compare retrieval and memory-management policies;
- automatically promote better policies with regression gates;
- support rollback when a policy reduces quality.

### Phase 4 — Memory infrastructure for agents

- expose Nemp through MCP and SDKs;
- support more coding agents without duplicating memory;
- add team and organisation memory scopes;
- make project knowledge reusable as executable agent context.

See [`docs/COGNITIVE_ARCHITECTURE.md`](docs/COGNITIVE_ARCHITECTURE.md) for the detailed architecture and implementation boundaries.

---

## Contributing

Nemp needs contributions in four main areas:

- coding-tool adapters;
- memory-quality algorithms;
- agent evaluation datasets;
- local-first developer experience.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

When proposing a new integration, preserve the canonical Nemp memory model. The goal is not to create another tool-specific memory store; the goal is to let another tool participate in the same project memory.

---

## Support

- [GitHub Issues](https://github.com/SukinShetty/Nemp-memory/issues)
- [Email](mailto:contact@nemp.dev)
- [Nemp website](https://nemp.dev)

---

## License

MIT © 2026 [Sukin Shetty](https://github.com/SukinShetty)

---

<div align="center">
  <p>Built by <a href="https://www.linkedin.com/in/sukinshetty-1984/">Sukin Shetty</a></p>
  <p><strong>Memory that thinks. Context that travels.</strong></p>
</div>
