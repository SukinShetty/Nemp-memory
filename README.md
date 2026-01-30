# Nemp

**Persistent memory for Claude Code.** Save context once, use it forever.

---

Claude forgets everything between sessions. Nemp fixes that.

Save your preferences, project conventions, architecture decisions, and anything else you'd rather not repeat. Nemp stores memories locally on your machine and makes them available whenever you need them.

## Why Nemp?

| Without Nemp | With Nemp |
|--------------|-----------|
| "Use Bun, not npm" (every session) | `/nemp:save tooling Use Bun for package management` (once) |
| Re-explaining your auth flow | `/nemp:recall auth` |
| Forgetting project conventions | `/nemp:list` to see everything |

## Installation

**Option 1: Clone the repository**
```bash
git clone https://github.com/SukinShetty/Nemp-memory.git
cd Nemp-memory
```

**Option 2: Copy to your project**
```bash
# Copy .claude-plugin/ and commands/ to your project root
```

That's it. No dependencies. No build step. No API keys.

## Commands

### Save a Memory

```
/nemp:save <key> <value>
```

```
/nemp:save auth-flow JWT tokens with 15min expiry, refresh tokens last 7 days
/nemp:save prefer-bun Always use Bun instead of npm
/nemp:save api-base https://api.example.com/v2
```

### Recall a Memory

```
/nemp:recall <key-or-search>
```

```
/nemp:recall auth-flow          # Exact key
/nemp:recall authentication     # Fuzzy search
/nemp:recall how does auth work # Natural language
```

### List All Memories

```
/nemp:list
```

Shows all saved memories with their keys and values.

### Forget a Memory

```
/nemp:forget <key>
```

Permanently deletes a memory (with confirmation).

### Global Memories

For preferences that apply across all your projects:

```
/nemp:save-global prefer-typescript I always prefer TypeScript over JavaScript
/nemp:recall-global prefer-typescript
/nemp:list-global
```

Global memories are stored in `~/.nemp/memories.json` and available everywhere.

## Storage

All data stays on your machine. No cloud. No sync. No tracking.

| Type | Location | Use Case |
|------|----------|----------|
| Project | `.nemp/memories.json` | Project-specific context |
| Global | `~/.nemp/memories.json` | Cross-project preferences |

Memories are plain JSON—easy to backup, edit, or migrate.

## Examples

**Save your coding preferences:**
```
/nemp:save style-guide Use 2 spaces, single quotes, no semicolons
/nemp:save testing-framework Jest with React Testing Library
/nemp:save-global editor-config VSCode with Vim keybindings
```

**Save architecture decisions:**
```
/nemp:save db-choice PostgreSQL with Prisma ORM
/nemp:save auth-strategy Session-based auth, no JWT for web app
/nemp:save api-style REST with JSON:API specification
```

**Save project context:**
```
/nemp:save deploy-process Push to main triggers Vercel deploy
/nemp:save env-vars DATABASE_URL, STRIPE_KEY, RESEND_API_KEY required
/nemp:save team-conventions PR requires 1 approval, squash merge only
```

## Privacy

- All memories stored locally in JSON files
- No external services or network requests
- No telemetry or analytics
- You own your data completely

## License

MIT

---

**Built for developers who are tired of repeating themselves.**

[Report Issues](https://github.com/SukinShetty/Nemp-memory/issues) · [Contribute](https://github.com/SukinShetty/Nemp-memory)
