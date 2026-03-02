# Cross-Provider Export: Gold Test Suite

## Purpose

This test suite validates that cross-provider memory export/import works correctly.
Save these 10 test memories, export to each provider, and verify the output.

## Step 1: Save Test Memories

Run these commands in Claude Code:

```
/nemp:save pkg-manager "Always use pnpm. Never use npm or yarn."
/nemp:save framework "Next.js 14 with App Router"
/nemp:save database "PostgreSQL via Prisma ORM"
/nemp:save test-cmd "Run tests with: pnpm test"
/nemp:save deploy-cmd "Deploy with: docker compose up -d"
/nemp:save style-vars "Use camelCase for variables, PascalCase for components"
/nemp:save api-base "Main API base URL is /api/v1"
/nemp:save no-env-commit "Never commit .env files to git"
/nemp:save auth-method "JWT authentication with refresh tokens"
/nemp:save error-handling "Always use try-catch with specific error types"
```

## Step 2: Export to All Providers

```
/nemp-pro:export --all
```

Expected output:
- AGENTS.md created (root)
- .cursor/rules/nemp-memory.mdc created
- .windsurfrules created
- CLAUDE.md updated

## Step 3: Codex CLI Validation

Switch to Codex CLI and ask these 10 questions. All should answer correctly using AGENTS.md:

| # | Question | Expected Answer |
|---|----------|----------------|
| 1 | What package manager should I use? | pnpm (never npm or yarn) |
| 2 | Run the tests | pnpm test |
| 3 | What framework is this? | Next.js 14 (App Router) |
| 4 | How do I deploy? | docker compose up -d |
| 5 | Variable naming convention? | camelCase for variables, PascalCase for components |
| 6 | What's the API base path? | /api/v1 |
| 7 | Should I commit .env? | No — never commit .env files |
| 8 | What database? | PostgreSQL via Prisma ORM |
| 9 | How does auth work? | JWT with refresh tokens |
| 10 | Write error handling | try-catch with specific error types |

Pass threshold: 10/10

## Step 4: Cursor Validation

Open project in Cursor. The .cursor/rules/nemp-memory.mdc rule should be auto-applied.
Ask the same 10 questions. Pass threshold: 10/10

## Step 5: Windsurf Validation

Open project in Windsurf. The .windsurfrules file should be auto-read.
Ask the same 10 questions. Pass threshold: 10/10

## Step 6: Import Round-Trip Test

Edit AGENTS.md manually to add:
```
- new-key: This was added in Codex
```

Then in Claude Code:
```
/nemp-pro:import --codex
```

Expected: "new-key" appears in /nemp:list

## Step 7: Auto-Export Test

```
/nemp-pro:auto-export on
/nemp:save test-auto "This tests auto-export"
```

Expected: AGENTS.md automatically updates to include "test-auto"

## Pass Criteria

- [ ] All 10 gold memories export correctly to all 3 providers
- [ ] Codex answers all 10 test questions correctly
- [ ] Import round-trip works (add in AGENTS.md → import to Nemp)
- [ ] Auto-export triggers on /nemp:save
- [ ] No extinct memories appear in exports
- [ ] Files stay under 4000 tokens
