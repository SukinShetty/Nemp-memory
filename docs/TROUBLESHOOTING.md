# Troubleshooting Nemp

Start with the smallest check. Keep a backup of memory and hand-written instructions before reinstalling or changing files.

## Commands do not appear

Inside Claude Code, open `/plugin` and confirm `nemp@nemp-memory` is installed and enabled. Restart the session if needed. Run `/nemp:list` from the intended project directory.

If the marketplace is missing:

```text
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp@nemp-memory
```

On Windows, try the repository URL ending in `.git` if cloning fails. Follow [Claude Code's current plugin documentation](https://code.claude.com/docs/en/discover-plugins) for host-specific errors or managed policies.

## A command beginning with nemp-pro is unknown

The public plugin name is `nemp`. Use `/nemp:auto-capture`, `/nemp:activity` and `/nemp:suggest`. Prototype provider export retains the filename-based name `/nemp:nemp-pro-export`; it is experimental. The `.nemp-pro/` data directory is a legacy path, not a separate installed plugin. See [Commands](COMMANDS.md).

## Git cannot clone the marketplace

In your shell, check `git --version`, then test access to the repository:

```bash
git ls-remote https://github.com/SukinShetty/Nemp-memory.git HEAD
```

Use the reported Git error to distinguish connectivity, authentication or policy problems. Do not disable certificate verification or bypass your organization's network controls. Ask your administrator about a required proxy rather than copying an arbitrary global proxy setting.

## File access or EPERM errors

Check which exact file was denied and whether it is locked by an editor or another process. Confirm your user can write to the project directory. Retry after closing a process holding the file. Avoid running the whole agent as Administrator or disabling antivirus as a default fix; on managed devices, involve your administrator.

## Memories seem missing

Confirm the current project directory and inspect the reported source. Project memory is in `.nemp/memories.json`; global memory is in `~/.nemp/memories.json`. Outside a Git repository, `save` defaults to global storage. Use `/nemp:list-global` to inspect it.

If the file exists, back it up before repairing JSON. The current commands describe multiple data shapes; do not replace a store with an empty one to silence a parse error. See [Architecture](ARCHITECTURE.md).

## CLAUDE.md is stale or changed unexpectedly

`/nemp:auto-sync status` shows whether supported writes should refresh context. It is not a file watcher. Run `/nemp:export` to refresh the default section and inspect the diff.

`/nemp:export --replace` overwrites the entire file. If it removed hand-written content, restore from your backup or version control. Nemp does not supply automatic undo. Keep recovery copies before retrying export or sync.

## Activity capture or auto-export does nothing

These are experimental. Enabling a config flag is not proof that a hook or trigger is running. The current hook path/executable wiring and auto-export triggers need validation; see [Release checks](RELEASE_CHECKLIST.md). Save important context explicitly with `/nemp:save` while those paths are being tested.

## Pro says it is not available

That is expected in this build. Cortex, Foresight, Decay and Import are notices, and `/nemp:activate` does not verify or unlock a license. Follow [nemp.dev](https://nemp.dev) and the [roadmap](ROADMAP.md) for the intended future flow. Do not paste a license key into public issues or logs.

## Reinstall or uninstall

Use the host's plugin management commands rather than deleting broad cache folders:

```text
/plugin uninstall nemp@nemp-memory
/plugin marketplace remove nemp-memory
```

Then reinstall using the setup guide if needed. Plugin removal and memory deletion are separate: preserve `.nemp/`, `.nemp-pro/` and `~/.nemp/` unless you intentionally want to remove their data. Inspect their contents and make a backup before deletion.

## Report a reproducible issue

Include your OS, host version, Nemp version, command, expected result and actual error. Redact memory values, project paths, credentials and private logs. Use [GitHub Issues](https://github.com/SukinShetty/Nemp-memory/issues) for ordinary bugs and [contact@nemp.dev](mailto:contact@nemp.dev) for sensitive reports.
