# Get started with Nemp

Nemp Open v0.3.0 stores working context in local files and uses your host agent to maintain it. The primary integration is Claude Code.

## 1. Install the plugin

You need Git, Claude Code with plugin support, and a project directory you can write to. Nemp's instruction examples use shell tools; the health check includes Python 3 commands. See [Claude Code's installation documentation](https://code.claude.com/docs/en/discover-plugins) for host requirements and plugin scopes.

Inside Claude Code:

```text
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp@nemp-memory
```

If the marketplace cannot clone on Windows, retry the same repository URL with `.git` at the end. Restart Claude Code after installation if commands are missing. Use `/plugin` to inspect installed plugins and `/nemp:list` to check Nemp.

## 2. Save and recall one decision

From the intended project directory:

```text
/nemp:save api-style "Use REST for the public API; keep GraphQL internal"
/nemp:recall api-style
/nemp:context api
```

Inside a Git repository, `/nemp:save` defaults to project memory. Outside one, its instructions default to global memory. Confirm the reported location if you are unsure. Use the explicit global commands for preferences shared across projects.

## 3. Keep it current

Saving an existing key updates the value:

```text
/nemp:save api-style "Use REST for all APIs; GraphQL retired after the migration"
/nemp:list
```

Review what the agent stored. Compression should preserve the meaning, constraints, paths and versions that matter. Use `/nemp:forget api-style` only when you want to delete it; the command asks for confirmation unless `--force` is supplied. There is no built-in undo.

## 4. Add context when it helps

```text
/nemp:init
/nemp:save-global language-style "Prefer strict TypeScript in new projects"
/nemp:recall-global language-style
```

`init` primarily reads `package.json` and checks supporting filenames. It is not a general-purpose scanner for every language. Review detected facts before relying on them.

## 5. Export to CLAUDE.md, optionally

```text
/nemp:export
/nemp:auto-sync on
```

Default export appends or updates the Nemp section. Auto-sync instructs `save`, `init` and `forget` to refresh it after changes. It is not a filesystem watcher. `/nemp:sync` reviews/imports `CLAUDE.md` context and detects some disagreements with project files.

Back up hand-written rules first. **`/nemp:export --replace` overwrites the entire `CLAUDE.md`.** Inspect the diff after export or sync.

## 6. Inspect before sharing

```text
/nemp:log
/nemp:health
```

Logs cover operations recorded by the command instructions, not every possible file access. Health is a diagnostic checklist, not a guarantee that memory content is true.

Keep `.nemp/` and `.nemp-pro/` out of version control by default. Exported context may contain the same private information as the source memories. Read [Privacy](PRIVACY.md) before sharing it.

## Alternative: load a local checkout

From your shell:

```bash
git clone https://github.com/SukinShetty/Nemp-memory.git
cd Nemp-memory
claude --plugin-dir .
```

This is useful for testing this checkout without modifying a plugin cache. See [Contributing](../CONTRIBUTING.md) for testing in an isolated project.

[Command reference](COMMANDS.md) · [Troubleshooting](TROUBLESHOOTING.md) · [Integrations](INTEGRATIONS.md)
