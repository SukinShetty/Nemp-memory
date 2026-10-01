# Nemp repository guide

Nemp — Agentic memory that evolves with your work.

## Current scope

- Package target: `0.3.0`; maintain agreement between both `.claude-plugin/` manifests
- Nemp Open is the MIT-licensed, instruction-based local-memory foundation
- Claude Code is the primary command integration
- Experimental activity/provider workflows and planned Pro features must be labeled accurately
- Local storage does not guarantee local model processing

## Structure and checks

Commands are Markdown instructions in `commands/`, not a standalone runtime. Skills live in `skills/nemp-memory/` and the root `SKILL.md`. Read `docs/ARCHITECTURE.md` and `docs/COMMANDS.md` before changing their behavior.

Run `python3 scripts/check_docs.py`. If Claude Code is available, also run `claude plugin validate .` and the manual checks in `tests/memory-smoke-test.md`. Report checks that were not run.

## Change boundaries

Preserve existing storage and command interfaces unless a deliberate migration is part of the task. Do not advertise a planned command as working. A syntax-shaped license key is not proof of entitlement, and this repository has no Pro unlock implementation.

Do not commit user memory or logs. Avoid reading secrets from `.env` files. Do not publish releases, announce a launch, or move/delete historical tags as part of documentation maintenance.
