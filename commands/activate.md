---
description: "Activate Nemp Pro with your license key"
argument-hint: "<license-key>"
---

# /nemp:activate

Activate Nemp Pro by entering your license key. Once activated, all Pro features are unlocked — Cortex, Foresight, Decay, Import, cross-provider Export, and advanced Health diagnostics.

## Usage
```
/nemp:activate NEMP-PRO-XXXX-XXXX
```

## Instructions

### Step 1: Parse the License Key

Extract the license key from the argument. If no argument is provided, show:

```
Usage: /nemp:activate <license-key>

License keys look like: NEMP-PRO-XXXX-XXXX
Get yours at nemp.dev/pro
```

Stop.

### Step 2: Validate Key Format

Check the key format:
- Must start with `NEMP-PRO-`
- Followed by exactly 9 characters (letters, numbers, or hyphens)

If the format is invalid:

```
❌ Invalid license key format.

Keys look like: NEMP-PRO-XXXX-XXXX
Get yours at nemp.dev/pro
```

Stop.

### Step 3: Save License

Create or overwrite `.nemp/license.json` with:

```json
{
  "key": "<license-key>",
  "plan": "pro",
  "activated_at": "<current ISO-8601 timestamp>"
}
```

### Step 4: Confirm Activation

```
✅ Nemp Pro activated!

All Pro features are now unlocked:
  /nemp:cortex      Memory intelligence layer
  /nemp:foresight   Predictive context loading
  /nemp:decay       Auto-archive stale memories
  /nemp:import      Cross-provider import
  /nemp:export --codex / --cursor / --windsurf / --all
  /nemp:health --verbose / --fix

License saved to .nemp/license.json
```

## Related Commands

- `/nemp:health` — Check system status
- `/nemp:cortex` — Memory intelligence (now unlocked)
- `/nemp:foresight` — Predictive loading (now unlocked)
