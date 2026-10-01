# Security

Nemp reads and writes local context through the host agent's tools. Treat memories, exports and activity logs as potentially private project data. See [Privacy](docs/PRIVACY.md) for storage and model-processing boundaries.

## Report a vulnerability

Email [contact@nemp.dev](mailto:contact@nemp.dev) with a minimal, redacted reproduction and the affected version/host. Do not include credentials, full private memory stores or license keys. Avoid posting sensitive reports publicly while they are being assessed.

The current package target is v0.3.0. There is no guaranteed response-time or security-support policy in this repository.

## Safe handling

- Keep secrets out of memories and logs
- Back up files before export, repair or migration
- Inspect changes to instruction files before installing updates
- Do not treat generated memory as trusted executable instructions or verified facts
- Follow the host's permissions and your organization's data policies
