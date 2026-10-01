# Nemp command reference

Nemp Open v0.3.0 uses the `nemp` plugin namespace. Run slash commands inside Claude Code, not in a plain shell. The linked command files contain the full host-agent instructions.

## Everyday memory

| Command | Purpose | Notes |
| --- | --- | --- |
| [`/nemp:save <key> <value>`](../commands/save.md) | Save or update context | Supports `--type <type>`; updates an existing key |
| [`/nemp:recall <key-or-query>`](../commands/recall.md) | Exact key, partial key or value search | Reads project/global stores and updates tracking fields |
| [`/nemp:context <topic>`](../commands/context.md) | Search with keyword expansion | Reads whole stores; no embedding service |
| [`/nemp:list`](../commands/list.md) | Inspect project and global entries | `--project`, `--global`, `--all`; regenerates the index |
| [`/nemp:forget <key>`](../commands/forget.md) | Delete an entry | Confirmation by default; `--force` skips it; no built-in undo |
| [`/nemp:init`](../commands/init.md) | Detect and save stack context | Primarily `package.json` plus filename checks |

`save` defaults to project storage inside a Git repository and global storage otherwise. Project context takes precedence during retrieval.

## Global preferences

| Command | Purpose |
| --- | --- |
| [`/nemp:save-global <key> <value>`](../commands/save-global.md) | Save reusable context to `~/.nemp/` |
| [`/nemp:recall-global <key-or-query>`](../commands/recall-global.md) | Search global memory |
| [`/nemp:list-global`](../commands/list-global.md) | Review global entries |

## Export, sync and inspection

| Command | Purpose | Notes |
| --- | --- | --- |
| [`/nemp:export`](../commands/export.md) | Export to `CLAUDE.md` | Default: append/update Nemp section |
| `/nemp:export --replace` | Replace the whole `CLAUDE.md` | Destructive to hand-written content; back up first |
| [`/nemp:auto-sync on\|off\|status`](../commands/auto-sync.md) | Toggle updates after save/init/forget | Not a background watcher |
| [`/nemp:sync`](../commands/sync.md) | Import/reconcile `CLAUDE.md` and review drift | Inspect proposed changes and resulting diff |
| [`/nemp:log`](../commands/log.md) | View recorded memory operations | `--tail N`, `--agent <name>`, `--clear` |
| [`/nemp:health`](../commands/health.md) | Run the diagnostic checklist | Score out of 80; not a factual-accuracy score |

## Experimental workflows

Test these in an isolated project. Configuration and instruction files exist, but end-to-end behavior is not established by the documentation checks.

| Command | Purpose | Status |
| --- | --- | --- |
| [`/nemp:auto-capture on\|off\|status`](../commands/auto-capture.md) | Configure activity capture | Experimental; hook wiring needs validation |
| [`/nemp:activity`](../commands/activity.md) | View captured activity | `--stats` or `--clear`; legacy `.nemp-pro/` log |
| [`/nemp:suggest`](../commands/suggest.md) | Review suggestions from activity | `--auto` explicitly enables saving suggestions without individual review |
| [`/nemp:nemp-pro-export`](../commands/nemp-pro-export.md) | Prototype provider-file export | `--codex`, `--cursor`, `--windsurf`, `--all`, `--status` |
| [`/nemp:auto-export`](../commands/auto-export.md) | Prototype export configuration | Hook-trigger execution is unverified in this build |

The unusual `nemp:nemp-pro-export` name follows the existing filename and `nemp` manifest; it is retained to avoid silently renaming an interface. Earlier instructions used `/nemp-pro:…`, but this repository does not declare a `nemp-pro` plugin. A future Pro interface is not finalized.

## Planned Pro commands

These are availability notices, not functioning Pro engines in this repository:

- [`/nemp:cortex`](../commands/cortex.md): planned memory review and intelligence
- [`/nemp:foresight`](../commands/foresight.md): planned task-aware retrieval
- [`/nemp:decay`](../commands/decay.md): planned reviewable memory aging/archival
- [`/nemp:import`](../commands/import.md): planned cross-tool import
- [`/nemp:activate`](../commands/activate.md): explains the planned upgrade path; no verified activation or unlock

Do not use `/nemp:export --codex` or `/nemp:health --fix` as released Open features. Their proposed Pro behavior is not implemented by those command files. See [Roadmap](ROADMAP.md).
