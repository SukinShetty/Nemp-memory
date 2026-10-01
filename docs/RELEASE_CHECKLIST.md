# v0.3.0 release-readiness checklist

This checklist prepares a review. It does not authorize a release, announcement, push, tag deletion or retagging.

## Documentation and identity

- [ ] README foregrounds Nemp and the agreed tagline
- [ ] Package and marketplace versions remain `0.3.0`
- [ ] Local-memory claims distinguish storage from host/model processing
- [ ] Open, experimental and planned Pro capabilities are clearly separated
- [ ] No notice-only command promises a paid unlock
- [ ] Relative links, command references, JSON and assets pass `python3 scripts/check_docs.py`
- [ ] README and diagram are reviewed in light and dark themes

## Runtime checks before announcing

- [ ] Run `claude plugin validate .` with the intended host version
- [ ] Test marketplace install and local plugin loading
- [ ] Run [memory smoke checks](../tests/memory-smoke-test.md) in a disposable project
- [ ] Verify schema compatibility across init/save/recall/context/export/sync
- [ ] Verify export preserves unrelated rules and clearly warns for `--replace`
- [ ] Verify project/global precedence and mixed-format data
- [ ] Test repeated writes, malformed JSON, denied writes and concurrent agents
- [ ] Validate activity hook paths and executable format before advertising capture
- [ ] Validate every claimed cross-tool workflow; mark pending tests honestly
- [ ] Review memory/log/backup ignore patterns and secret handling

## Known source-level gaps

These need runtime work or evidence, beyond a branding/docs change:

- Command definitions describe multiple JSON storage shapes
- The hook is under `.claude-plugin/hooks/`; the manifest does not point to it, and its command refers to `hooks/post-tool.md`, which is not an executable script at that path
- Auto-export configuration does not establish a verified save/init/forget trigger
- Cross-provider import and Pro intelligence commands are notices
- Tracking counters, scoring and audit-log completeness are not validated
- `sync-plugin.ps1` is a maintainer-specific cache-copy helper with hard-coded paths; prefer `--plugin-dir` for development

## Release operation

- [ ] Owner explicitly approves the release and announcement
- [ ] Confirm the intended commit and reconcile the existing `v0.3.0` / `v0.4.0` historical tags without silently moving or deleting them
- [ ] Record actual runtime verification and remaining limitations
- [ ] Review the release notes against the exact shipped commit

Historical releases are not changed by this repository revision.
