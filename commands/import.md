---
description: "Import memories from other AI providers (Codex, Cursor, Windsurf) back into Nemp"
argument-hint: "[--codex|--cursor|--windsurf|--auto]"
---

# /nemp-pro:import

Import memories from other AI provider rule files back into Nemp's local storage. Supports Codex CLI (AGENTS.md), Cursor (.cursor/rules/nemp-memory.mdc), and Windsurf (.windsurfrules). Detects new entries, surfaces conflicts, and asks for confirmation before overwriting existing values.

## Usage
```
/nemp-pro:import --codex      # Import from AGENTS.md
/nemp-pro:import --cursor     # Import from .cursor/rules/nemp-memory.mdc
/nemp-pro:import --windsurf   # Import from .windsurfrules
/nemp-pro:import --auto       # Detect and import from all sources that exist
```

## Instructions

### Parsing Logic

For all providers, parsed lines follow `- key: value` format under `## Section` headers.

**Rules for parsing a line:**
- Skip lines that start with `>` (metadata comments)
- Skip lines that start with `#` (section headers)
- Skip lines that start with `---` (dividers / frontmatter delimiters)
- Skip lines that start with `<!--` (HTML comments)
- For all remaining lines that start with `-`: split on the FIRST `: ` occurrence to get key and value
- Trim whitespace from both key and value
- Skip the entry if the key is empty after trimming

**Map section headers to memory types:**
- `## Facts` → `type: "fact"`
- `## Rules` → `type: "rule"`
- `## Procedures` → `type: "procedure"`
- `## Preferences` → `type: "preference"`
- `## Warnings` → `type: "warning"`
- `## Decisions` → `type: "decision"`
- `## Other` → no `type` field added

Track the current active section as you scan lines. Reset the section to `null` on `## Other`.

---

### `--codex` — Import from AGENTS.md

**Step 1: Check file exists**

Check if `AGENTS.md` exists in the current project root.

If it does not exist, stop and output:
```
No AGENTS.md found. Run /nemp-pro:export --codex first.
```

**Step 2: Read and parse AGENTS.md**

Read `AGENTS.md`. Apply the parsing logic above to extract all `key: value` pairs and their associated section types.

**Step 3: Load existing memories**

Read `.nemp/memories.json`. If it does not exist, treat the memories array as empty (`[]`).

**Step 4: Compare and reconcile**

For each parsed entry from AGENTS.md:

- **Key does not exist in memories.json:** Add as a new memory (see "New memory format" below). Set `confidence.source = "imported-from-codex"`. Mark as "new".
- **Key exists with the SAME value:** Mark as "unchanged". No action needed.
- **Key exists with a DIFFERENT value:** Use AskUserQuestion to show the conflict and ask for resolution:

```
Conflict detected for key "<key>":
  Current (Nemp):  "<existing value>"
  In AGENTS.md:    "<new value>"

Which value should win?
```

Options: "Keep Nemp value", "Use AGENTS.md value", "Skip this key"

- If "Keep Nemp value": mark as "skipped", no change.
- If "Use AGENTS.md value": update the memory's `value` and `updated` timestamp, set `confidence.source = "imported-from-codex"`. Mark as "updated".
- If "Skip this key": mark as "skipped".

**Step 5: Write memories.json**

If any memories were added or updated, write the full updated memories.json back to `.nemp/memories.json`.

**Step 6: Report**

```
Import from AGENTS.md complete

  New memories:    3
  Updated:         1
  Unchanged:       8
  Skipped:         0

New memories saved to .nemp/memories.json
Run /nemp-pro:export --codex to sync back if needed.
```

---

### `--cursor` — Import from Cursor rules

**Step 1: Check file exists**

Check if `.cursor/rules/nemp-memory.mdc` exists.

If it does not exist, stop and output:
```
No .cursor/rules/nemp-memory.mdc found. Run /nemp-pro:export --cursor first.
```

**Step 2: Read and parse .cursor/rules/nemp-memory.mdc**

Read the file. Skip the MDC frontmatter: ignore all lines between the opening `---` and closing `---` at the top of the file before parsing begins.

After the frontmatter, apply the standard parsing logic to extract all `key: value` pairs and their associated section types.

**Step 3–6: Same as --codex**

Follow the same compare, reconcile, write, and report steps as `--codex`.

Use `confidence.source = "imported-from-cursor"` for all new or updated memories.

Report source as `.cursor/rules/nemp-memory.mdc` in the output.

---

### `--windsurf` — Import from Windsurf rules

**Step 1: Check file exists**

Check if `.windsurfrules` exists in the current project root.

If it does not exist, stop and output:
```
No .windsurfrules found. Run /nemp-pro:export --windsurf first.
```

**Step 2: Read and parse .windsurfrules**

Read the file and apply the standard parsing logic to extract all `key: value` pairs and their associated section types.

**Step 3–6: Same as --codex**

Follow the same compare, reconcile, write, and report steps as `--codex`.

Use `confidence.source = "imported-from-windsurf"` for all new or updated memories.

Report source as `.windsurfrules` in the output.

---

### `--auto` — Auto-detect and import from all sources

**Step 1: Detect which provider files exist**

Check for the presence of each of these files:
- `AGENTS.md` (Codex CLI)
- `.cursor/rules/nemp-memory.mdc` (Cursor)
- `.windsurfrules` (Windsurf)

If none of them exist, output:
```
No provider files found. Run /nemp-pro:export --all first.
```
Then stop.

**Step 2: Import from each detected source**

For each file that exists, run the full import process for that provider (steps 2–5 from the respective provider section above).

Process them in order: Codex first, Cursor second, Windsurf third.

For conflict resolution across multiple sources: if the same key conflicts in more than one source, present each conflict individually using AskUserQuestion with the source name clearly indicated.

**Step 3: Report per-source stats and totals**

```
Auto-import complete

  Source: AGENTS.md
    New: 2  Updated: 1  Unchanged: 7  Skipped: 0

  Source: .cursor/rules/nemp-memory.mdc
    New: 0  Updated: 0  Unchanged: 10  Skipped: 0

  Source: .windsurfrules
    New: 1  Updated: 0  Unchanged: 9  Skipped: 0

  Total new:       3
  Total updated:   1
  Total unchanged: 26
  Total skipped:   0

All changes saved to .nemp/memories.json
```

---

### New memory format when importing

When adding a new memory discovered during import, write it in this format:

```json
{
  "key": "<parsed-key>",
  "value": "<parsed-value>",
  "created": "<current-ISO-timestamp>",
  "updated": "<current-ISO-timestamp>",
  "projectPath": "<current-project-path>",
  "agent_id": "nemp-pro-import",
  "tags": ["imported"],
  "confidence": {
    "source": "imported-from-codex",
    "score": 0.8
  }
}
```

Set `confidence.source` to the appropriate value for the provider:
- Codex: `"imported-from-codex"`
- Cursor: `"imported-from-cursor"`
- Windsurf: `"imported-from-windsurf"`

If the parsed entry has an associated section type (fact, rule, procedure, etc.), add a `"type"` field to the memory object alongside the other fields.

---

## Related Commands
- `/nemp-pro:export` - Export memories to provider-specific rule files
- `/nemp-pro:auto-export` - Toggle auto-export on every /nemp:save
- `/nemp:list` - View all memories currently in Nemp
- `/nemp:forget` - Remove a memory by key
