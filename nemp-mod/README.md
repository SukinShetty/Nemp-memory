# nemp-mod

> **Experimental.** A Claude Code mod (function hooks, early-access API) that brings Nemp memory into the session. It is separate from the `nemp` plugin at the repository root and is not part of the Nemp Open 0.3.0 package.

## Load it

```bash
claude --plugin-dir ./nemp-mod
```

## What it does

| Feature | Behavior |
| --- | --- |
| Recall | On each prompt (slash commands skipped), scores memories from `.nemp/memories.json` and `~/.nemp/memories.json` and attaches up to 5 above a relevance threshold as hidden context. Your prompt text is never changed. If recall fails or takes over 2 seconds, the prompt goes through unchanged and a toast says so. |
| `/nemp-pane` | Opens a "Nemp" pane listing what the last prompt received, with score and source. Keys 1-5 pin, 6-0 drop. Pinned memories are always attached; dropped ones never are, for this session. If the pane cannot be placed, a compact band appears above the prompt. |
| `nemp_recall` tool | Lets Claude search memory mid-task (`query`, optional `limit` 1-20). Listed as `mcp__nemp-mod__nemp_recall`. |
| Status line | `Nemp · <total> memories · <n> recalled` |
| `/nemp-capture on\|off` | Off by default. When on, after each main-loop turn (never subagents) one cached `$.model.fork` question asks for up to 3 key decisions, which are saved following `commands/save.md` (entry fields, type inference, cortex defaults, upsert by key, `access.log` WRITE line). |

## Boundaries

- Memories are read and written locally, but recalled memories are sent to the model as context, and capture sends one extra request over the conversation. Local storage does not mean local processing.
- Retrieval is keyword scoring with a small synonym list, following `commands/recall.md`; there are no embeddings.
- Recall here is read-only: it does not update vitality counters as `/nemp:recall` does.
- Capture does not run `save.md`'s auto-sync to `CLAUDE.md` or its contradiction check. Captured entries are marked `confidence.source: "agent-inferred"`.
- Stores in the `{ "memories": [...] }`, array and key-map layouts are all read; a write keeps the layout the file already uses. A store that does not parse is never overwritten.

## Checks

```bash
claude plugin validate ./nemp-mod
claude plugin test ./nemp-mod
```
