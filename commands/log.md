---
description: "View memory access log (reads, writes, deletes)"
argument-hint: "[--tail N | --agent <name> | --clear]"
---

# /nemp:log

View the memory access audit trail showing all reads, writes, and deletes.

## Usage
/nemp:log                  # Show last 20 entries
/nemp:log --tail 50        # Show last 50 entries
/nemp:log --agent backend  # Filter by agent name
/nemp:log --clear          # Clear the log

## Instructions

### 1. Read Access Log
```bash
[ -f ".nemp/access.log" ] && tail -20 .nemp/access.log
```

If no log exists:
📋 No access log yet.
The log tracks automatically when you use:
/nemp:save    → WRITE entries
/nemp:recall  → READ entries
/nemp:forget  → DELETE entries
/nemp:init    → INIT entries

### 2. Parse and Display

**Default (last 20 entries):**
📋 Nemp Access Log
TIMESTAMP              ACTION    KEY              AGENT
2026-02-11 14:30:00    INIT      (6 memories)     nemp-init
2026-02-11 14:32:15    READ      auth-flow        main
2026-02-11 14:35:00    WRITE     api-design       backend
2026-02-11 14:35:02    READ      auth-flow        frontend
2026-02-11 14:35:03    READ      database         tester
2026-02-11 14:40:00    DELETE    old-api          main
Agents active: main, nemp-init, backend, frontend, tester

**With --agent filter:**
```bash
grep "agent=backend" .nemp/access.log
```
📋 Access Log — Agent: backend
TIMESTAMP              ACTION    KEY
2026-02-11 14:35:00    WRITE     api-design
2026-02-11 14:36:00    READ      auth-flow
2 entries by "backend"

**With --tail N:**
```bash
tail -N .nemp/access.log
```

**With --clear:**
Ask confirmation, then:
```bash
rm .nemp/access.log
```

## Log Format

Each line:
[ISO-TIMESTAMP] ACTION key=KEY agent=AGENT_NAME extra=INFO

Examples:
[2026-02-11T14:30:00Z] WRITE key=auth-flow agent=nemp-init chars=45
[2026-02-11T14:32:15Z] READ key=auth-flow agent=main query=auth
[2026-02-11T14:40:00Z] DELETE key=old-api agent=main
[2026-02-11T14:30:00Z] INIT agent=nemp-init memories_saved=6

## Related Commands
- `/nemp:list` - List all memories
- `/nemp:save` - Save a memory (creates WRITE log)
- `/nemp:recall` - Recall a memory (creates READ log)
