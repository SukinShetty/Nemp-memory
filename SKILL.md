---
name: nemp-memory
description: Project-owned cognitive memory for AI agents. Preserve decisions, rules, goals, warnings and failure patterns across sessions and coding tools using a local, inspectable memory store.
metadata: {"openclaw": {"always": true}}
---

# Nemp Memory

Use Nemp as the project memory layer rather than treating the current agent conversation as the source of truth.

Nemp should help the agent:

- recall relevant project facts, decisions, rules and procedures;
- load task-specific context instead of every stored memory;
- preserve warnings and known error patterns;
- record important new knowledge with provenance;
- detect stale or conflicting context;
- keep project knowledge portable across coding agents.

The canonical memory belongs to the project and should remain inspectable by the user.
