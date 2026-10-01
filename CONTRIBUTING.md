# Contributing to Nemp

Nemp is agentic memory that evolves with your work. Useful contributions make that promise concrete: clearer context, safer updates and evidence that the workflow works.

## Start with an issue

For bugs, include the host/version, OS, Nemp version, exact command, expected result and a minimal redacted example. For features, explain the workflow and why current commands cannot support it. Avoid posting private memories, credentials or unredacted logs.

## Work on a local checkout

```bash
git clone https://github.com/YOUR_USERNAME/Nemp-memory.git
cd Nemp-memory
claude --plugin-dir .
```

For a realistic memory test, create a disposable project, initialize Git there, and start Claude Code with `--plugin-dir /absolute/path/to/Nemp-memory`. This prevents sample memories from contaminating your real work.

`sync-plugin.ps1` is a legacy maintainer-specific cache helper with hard-coded paths. It is not the recommended setup path. Use the host's [local plugin workflow](https://code.claude.com/docs/en/plugins) instead.

## Repository map

- `commands/`: instructions executed by the host agent
- `skills/nemp-memory/`: Claude Code skill entry point
- `SKILL.md`: experimental file-based entry point for other skill hosts
- `.claude-plugin/`: plugin and marketplace manifests; experimental hook material
- `docs/`: product behavior, limitations, setup, privacy and roadmap
- `assets/brand/`: current mark and editable lifecycle diagram
- `tests/`: manual acceptance plans, not claims of passing runtime tests
- `scripts/check_docs.py`: dependency-free static consistency checks

## Checks before a pull request

```bash
python3 scripts/check_docs.py
claude plugin validate .
```

Run the [memory smoke checks](tests/memory-smoke-test.md) in your test host. Record what passed, failed or was not run. Static checks do not execute memory commands or prove cross-provider compatibility.

When changing a command, review every linked example and the [command reference](docs/COMMANDS.md). Preserve existing memory, surrounding rules and user settings. Explain schema changes and include migration/rollback tests before claiming compatibility.

Keep the product version at `0.3.0` unless a version change is explicitly agreed. Do not move historical tags to match documentation.

## What needs help

- Storage-shape consistency and safe migration
- Atomic/concurrent writes and recoverable edits
- Reliable activity hooks and export boundaries
- Retrieval fixtures that measure useful context, not just repeated reads
- Host-specific integration tests with redacted inputs and observed results

## Writing and design

Follow [Brand](docs/BRAND.md). Name Nemp first; put host integrations in their own context. Distinguish shipped, experimental and planned work. Prefer inspectable examples over superlatives, unsupported compatibility claims or performance numbers.

Open a focused pull request with a summary, changed behavior, checks performed and remaining limitations. See the [Code of Conduct](CODE_OF_CONDUCT.md).
