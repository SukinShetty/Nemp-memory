---
description: "Explain Nemp Pro availability and the planned activation flow"
argument-hint: "[license-key]"
---

# /nemp:activate

Nemp Pro is in development. This public v0.3.0 build does not implement license verification, Pro installation or feature unlocking.

## Instructions

When invoked, display this availability notice and stop:

```text
Nemp Pro is not available to activate in this build.

The intended upgrade path is:
  nemp.dev → purchase Pro when available → receive a license key
  → /nemp:activate <license-key> in your terminal agent

This repository does not verify a key or unlock Pro features.
Cortex, Foresight, Decay and Import are planned-feature notices here.

You can continue using Nemp Open's local-memory commands.
See nemp.dev and the repository roadmap for availability.
```

If an argument was supplied, do not echo, log, save or transmit it. A key's format is not proof of a valid license. Do not create or overwrite `.nemp/license.json`, infer entitlement from an existing file, or claim activation succeeded.

If an earlier build wrote a license file, explain that it does not establish a working entitlement in this repository. Leave it unchanged; do not remove user data as part of this notice.

## Related documentation

- [Roadmap and intended upgrade flow](../docs/ROADMAP.md)
- [Current commands](../docs/COMMANDS.md)
- [Local-memory privacy boundaries](../docs/PRIVACY.md)
