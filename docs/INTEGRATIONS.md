# Integration status

Nemp's memory files are portable. An integration also needs reliable instructions, supported paths and tested host behavior. File access alone is not a compatibility guarantee.

## Claude Code: primary integration

The manifest declares `nemp`, the marketplace declares `nemp-memory`, and command files live in `commands/`. Install with `nemp@nemp-memory`. This is the primary path documented in [Getting started](GETTING_STARTED.md).

The plugin's [memory skill](../skills/nemp-memory/SKILL.md) tells the host how to use the commands and local files. Command execution still depends on the agent following instructions. [Manual smoke checks](../tests/memory-smoke-test.md) are separate from static documentation validation.

## OpenClaw / Agent Skills: experimental entry point

The root [SKILL.md](../SKILL.md) provides a file-based entry point, including links to this repository's command instructions. Loading the skill, choosing the correct project directory and confirming read/write behavior require host-specific testing.

The repository retains an [earlier OpenClaw demonstration image](../assets/images/nemp-openclaw-telegram.jpeg), but it is not proof that the full current command set works there. Do not assume Claude Code slash commands are automatically registered in another host.

## Codex CLI, Cursor and Windsurf: prototype export instructions

[Provider export instructions](../commands/nemp-pro-export.md) describe generating `AGENTS.md`, `.cursor/rules/nemp-memory.mdc` and `.windsurfrules`. [Auto-export configuration](../commands/auto-export.md) and a [cross-provider acceptance plan](../tests/cross-provider-gold-test.md) also exist.

These are experimental source material. End-to-end export/import, preservation of existing rules, command names and automatic triggers need validation. `/nemp:import` currently displays a planned-feature notice, so a working round trip cannot be claimed.

## Other agents

An agent with authorized filesystem access can inspect local Nemp files. To add a supported integration, document:

1. How the host loads the instructions and resolves project/global paths
2. Which memory shapes it can read and safely update
3. How it preserves user rules, permissions and existing files
4. How privacy, logs, errors and concurrent writes are handled
5. The tested host version, fixtures, commands and observed results

Use the [contribution guide](../CONTRIBUTING.md). Keep untested compatibility claims out of badges and product descriptions.
