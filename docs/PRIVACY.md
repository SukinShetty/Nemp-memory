# Local memory and privacy

Nemp Open v0.3.0 stores memory as files you control. It does not include a hosted memory backend or telemetry service.

## Storage is local; model processing depends on your host

Nemp's command instructions ask your agent to read and write project/home-directory files. If that agent uses a remote model, memory content read into its context can be sent to the model provider under the host's settings, account terms and policies. Nemp cannot make a cloud-hosted agent run locally.

Installing/updating the plugin can access GitHub. Visiting nemp.dev, purchasing a future Pro license and validating/delivering a future license are separate network activities. The public activation command does not implement these services.

## What can be stored

- Memory values, tags, timestamps, agent identifiers and tracking metadata
- Project paths and preferences
- Access-log keys and queries for operations that record them
- With experimental capture enabled, file paths and command/activity details
- Exported memory content in `CLAUDE.md` or experimental provider files

Local files are not automatically encrypted, access-controlled or backed up by Nemp. Other software or people with filesystem access may read them.

## Keep sensitive material out

Do not store passwords, tokens, API keys, private keys or payment details. Avoid copying secrets into memory values, queries or shell commands that may be logged. Never scan `.env` contents to populate memory. Review client/employer policies before storing confidential context.

Exclude `.nemp/` and `.nemp-pro/` from version control unless you intentionally choose a reviewed sharing workflow. This repository ignores both paths; your own project needs its own ignore rules. Review exported files separately because they can expose the same context.

## Changing or deleting context

`/nemp:save` updates a key. `/nemp:forget` deletes one, with confirmation unless `--force` is used. It does not implement archival or undo. An entry may also remain in exports, backups or Git history. Refresh or review those copies separately.

`/nemp:log --clear` clears the local access log after confirmation. `/nemp:activity --clear` clears the experimental activity log. Disabling capture stops the configured workflow; it does not erase existing logs.

Uninstalling the plugin does not require deleting memory. Back up files you want to keep before removing project `.nemp/`, experimental `.nemp-pro/` or global `~/.nemp/` folders.

## Reporting a security issue

Send a minimal, redacted description to [contact@nemp.dev](mailto:contact@nemp.dev). Do not post credentials, private memories or unredacted logs in a public issue. See [Security](../SECURITY.md).
