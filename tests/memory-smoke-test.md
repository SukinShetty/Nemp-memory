# Nemp Open manual smoke checks

Status: **acceptance plan; not an automated result**. Run against the exact commit intended for release and record the host/version, OS, date and observations. Use a disposable Git project and synthetic data. Back up any pre-existing test files.

## Core loop

1. Load the checkout with `claude --plugin-dir /absolute/path/to/Nemp-memory`
2. Run `/nemp:list` with no store; confirm a clear empty state
3. Save `api-style` as `Use REST for public endpoints`; recall it exactly
4. Update the same key to `Use REST for all APIs`; confirm there is one updated entry
5. Search `/nemp:context api`; inspect the returned value and source
6. Inspect JSON, timestamps, type, attribution and generated index; record actual shape
7. Start a fresh session and recall the same key
8. Save a synthetic global preference; verify project/global source and precedence

## Export boundaries

1. Create `CLAUDE.md` with synthetic hand-written text before and after an existing Nemp section
2. Run `/nemp:export`; verify unrelated text remains byte-for-byte intact
3. Enable auto-sync, update the key, and inspect the result
4. Repeat export and verify it does not duplicate sections
5. Test `--replace` only in a disposable copy; verify the whole-file overwrite is clearly understood

## Review and deletion

1. Run `/nemp:log` and compare recorded operations with the commands actually invoked
2. Run `/nemp:health`; record observed warnings and the score, without treating it as factual confidence
3. Invoke `/nemp:forget api-style`; decline, then confirm on a second attempt
4. Verify the entry is removed only after confirmation; inspect index/export behavior

## Failure and repeat checks

- Invalid JSON must be reported without silently replacing the store
- Denied writes must not produce success claims
- Test legacy map, array and wrapped-array fixtures separately; report incompatible commands
- Test two agent writes and record lost-update or locking behavior
- Test a key shared by project/global memory and record which entry deletion affects
- Verify Pro notices do not mutate files or claim activation, even with a key-shaped argument
- Treat capture, suggestions and prototype exports as separate experimental checks

Do not mark this plan passed because `scripts/check_docs.py` succeeds. That script checks repository consistency only.
