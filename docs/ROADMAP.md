# Nemp roadmap

**Agentic memory that evolves with your work.**

The direction is useful context that becomes easier to trust and maintain as work changes. This page separates the current foundation from planned behavior. It is not a release-date or feature-delivery promise.

## Nemp Open v0.3.0: the foundation

Current command instructions cover local project/global storage, saving and updating entries, keyword retrieval, `CLAUDE.md` export/sync, metadata, logs and a health checklist. Experimental work includes activity suggestions and provider-file export.

The current package target remains **0.3.0**. Historical GitHub tags/releases are separate records; this documentation update does not create, replace or remove one.

## Strengthen the foundation

Before expanding the feature claims:

- Standardize the storage schema and test migrations from existing shapes
- Make updates atomic and protect against concurrent-agent lost writes
- Test exports against hand-written rules and malformed/legacy data
- Fix and validate activity-hook installation and execution
- Separate observed usage from confidence in a memory's truth
- Add reproducible end-to-end fixtures and host-specific test results

## Nemp Pro: planned memory maintenance

| Direction | Intended result | Required guardrail |
| --- | --- | --- |
| Feedback-aware retrieval | Use relevance and explicit feedback to choose context | Measure useful recall; do not equate frequency with truth |
| Source-backed correction | Turn recurring corrections into an evidence-linked memory diff | Check sources or regressions, support accept/undo, and revalidate after source changes |
| Contradiction review | Surface incompatible decisions or stale assumptions | Explain the conflict; avoid silent overwrites |
| Consolidation | Reduce redundant entries without losing constraints | Preview changes and preserve recoverable originals |
| Reversible archival | Retire stale context without losing history | Restore and undo before automated forgetting |
| Cross-tool portability | Move reviewed context between agent tools | Preserve unrelated rules and test round trips |

The retained [Cortex design proposal](../nemp-cortex-complete-spec.md) contains earlier concepts. It is design material, not an implemented feature list or final product contract.

## Intended terminal upgrade experience

1. Visit [nemp.dev](https://nemp.dev) and choose Pro when available
2. Complete purchase and receive a license key
3. Run `/nemp:activate <license-key>` in the terminal agent
4. Confirm genuine license verification and installation/availability of the Pro capabilities

The intended memory-storage model remains local. Purchase, license validation and software delivery may need network access and must be disclosed separately.

**This repository does not implement checkout, license verification, Pro delivery or feature unlock.** The current activation command reports that boundary without storing a key or claiming success. Do not request payment on the basis that this build can unlock the Pro notices.

## Release readiness

Follow the [release checklist](RELEASE_CHECKLIST.md). Keep release creation, announcements and version/tag decisions explicit. Documentation validation is one check; it is not proof that the host-agent workflows have passed.
