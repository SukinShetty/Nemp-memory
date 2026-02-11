---
description: "Auto-detect project stack and save as memories"
argument-hint: ""
---

# /nemp:init

Intelligently scan your project and auto-save context as memories.

## Instructions

You are an intelligent project analyzer. Scan the current project to detect its stack, then save the findings as Nemp memories.

### Step 1: Lightweight Scan (Token Optimized)

**IMPORTANT: Use minimal token consumption. Only read essential files. Run ONE combined check.**
```bash
echo "=== FILES ===" && ls package.json tsconfig.json next.config.* vite.config.* nuxt.config.* astro.config.* svelte.config.* angular.json requirements.txt pyproject.toml Cargo.toml go.mod Gemfile docker-compose.* Dockerfile .env .env.local .env.example 2>/dev/null && echo "=== LOCKFILE ===" && ls package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null && echo "=== DIRS ===" && ls -d app pages src/app components/ui 2>/dev/null
```

**DO NOT** run multiple separate file-existence checks. One command, all checks.

### Step 2: Read package.json ONLY (if exists)

**IMPORTANT: This is the ONLY file you need to read for detection. DO NOT read README.md, .env files, or scan directories.**
```bash
[ -f "package.json" ] && cat package.json
```

From package.json, detect everything using the tables in Step 3.

### Step 3: Parse package.json

**Detect Framework** from dependencies or devDependencies:
| Package | Framework |
|---------|-----------|
| `next` | Next.js |
| `react` (without next) | React (standalone) |
| `@remix-run/react` | Remix |
| `vue` | Vue.js |
| `nuxt` | Nuxt.js |
| `astro` | Astro |
| `svelte` | Svelte |
| `@sveltejs/kit` | SvelteKit |
| `express` | Express.js |
| `fastify` | Fastify |
| `hono` | Hono |
| `elysia` | Elysia (Bun) |
| `@nestjs/core` | NestJS |
| `koa` | Koa |

**Detect Language:**
- `typescript` in devDependencies → TypeScript
- tsconfig.json exists → TypeScript
- Otherwise → JavaScript

**Detect Database/ORM:**
| Package | Database/ORM |
|---------|--------------|
| `prisma` or `@prisma/client` | Prisma ORM |
| `drizzle-orm` | Drizzle ORM |
| `mongoose` | MongoDB (Mongoose) |
| `pg` | PostgreSQL (node-postgres) |
| `mysql2` | MySQL |
| `better-sqlite3` | SQLite |
| `@supabase/supabase-js` | Supabase |
| `firebase` | Firebase |
| `@planetscale/database` | PlanetScale |
| `@neondatabase/serverless` | Neon |
| `redis` or `ioredis` | Redis |

**Detect Authentication:**
| Package | Auth Solution |
|---------|---------------|
| `next-auth` or `@auth/nextjs` | NextAuth.js (Auth.js) |
| `@clerk/nextjs` | Clerk |
| `@supabase/auth-helpers-nextjs` | Supabase Auth |
| `lucia` | Lucia Auth |
| `passport` | Passport.js |
| `@kinde-oss/kinde-auth-nextjs` | Kinde |
| `firebase` (with auth imports) | Firebase Auth |

**Detect Styling:**
| Package | Styling |
|---------|---------|
| `tailwindcss` | Tailwind CSS |
| `@emotion/react` | Emotion |
| `styled-components` | Styled Components |
| `sass` | Sass/SCSS |
| `@chakra-ui/react` | Chakra UI |
| `@mantine/core` | Mantine |
| `@radix-ui/react-*` | Radix UI |
| `shadcn` (check components/ui) | shadcn/ui |

**Detect Testing:**
| Package | Testing |
|---------|---------|
| `jest` | Jest |
| `vitest` | Vitest |
| `@testing-library/react` | React Testing Library |
| `playwright` | Playwright |
| `cypress` | Cypress |

**Detect State Management:**
| Package | State |
|---------|-------|
| `zustand` | Zustand |
| `@reduxjs/toolkit` | Redux Toolkit |
| `jotai` | Jotai |
| `recoil` | Recoil |
| `@tanstack/react-query` | TanStack Query |
| `swr` | SWR |

### Step 4: Display Summary

Show a compact summary:
🔍 NEMP PROJECT SCAN
Project: [name from package.json]
Framework: [detected]
Language: [TypeScript/JavaScript]
Database: [detected or "none detected"]
Auth: [detected or "none detected"]
Styling: [detected or "none detected"]
Testing: [detected or "none detected"]
Package Manager: [npm/yarn/pnpm/bun from lockfile in Step 1]

### Step 5: Save ALL Memories in ONE Write

**CRITICAL: Do NOT call /nemp:save individually for each memory. Build the full JSON object and write once.**

Only include keys for things actually detected. Compress all values to under 100 characters.
```json
{
  "stack": {
    "value": "Next.js 14 + TypeScript + Prisma + PostgreSQL + Tailwind",
    "created": "<ISO-8601>",
    "updated": "<ISO-8601>",
    "agent_id": "nemp-init",
    "tags": ["auto-detected"]
  },
  "framework": {
    "value": "Next.js 14, App Router",
    "created": "<ISO-8601>",
    "updated": "<ISO-8601>",
    "agent_id": "nemp-init",
    "tags": ["auto-detected"]
  },
  "database": {
    "value": "PostgreSQL via Prisma",
    "created": "<ISO-8601>",
    "updated": "<ISO-8601>",
    "agent_id": "nemp-init",
    "tags": ["auto-detected"]
  }
}
```

Write this to `.nemp/memories.json` in a single operation:
```bash
mkdir -p .nemp
```

Then use the Write tool to save the complete JSON.

If `.nemp/memories.json` already exists, merge: preserve existing keys, only add/update detected keys.

### Step 6: Log the Init Operation
```bash
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] INIT agent=nemp-init memories_saved=<count>" >> .nemp/access.log
```

### Step 7: Generate MEMORY.md Index

Create or update `.nemp/MEMORY.md`:
```markdown
# Nemp Memory Index

> Auto-generated. Last updated: [YYYY-MM-DD HH:MM]

## Stored Memories

| Key | Preview | Agent | Updated |
|-----|---------|-------|---------|
| stack | Next.js 14 + TypeScript... | nemp-init | 2026-02-11 |
| database | PostgreSQL via Prisma | nemp-init | 2026-02-11 |
| auth | NextAuth.js with JWT | nemp-init | 2026-02-11 |

## Files

| File | Purpose |
|------|---------|
| `memories.json` | All stored memories (key-value pairs) |
| `access.log` | Read/write audit trail |
| `config.json` | Plugin configuration |
| `MEMORY.md` | This index file |
```

### Step 8: Check Auto-Sync Config (REQUIRED)

After saving all memories, check:
```bash
[ -f ".nemp/config.json" ] && cat .nemp/config.json
```

If `"autoSync": true`, generate and update CLAUDE.md with all memories grouped by category. Same logic as save.md.

### Step 9: Show Completion
✓ Nemp initialized! Saved [X] memories.
stack: Next.js 14 + TypeScript + Prisma...
database: PostgreSQL via Prisma
auth: NextAuth.js with JWT
styling: Tailwind CSS
package-manager: pnpm
✓ MEMORY.md index generated
✓ CLAUDE.md synced    ← only if auto-sync enabled
/nemp:list        View all memories
/nemp:context     Search by keyword

## Important Notes

- Only save memories for things actually detected
- Compress values: "Next.js 14 + TypeScript" not "We are using Next.js version 14 with TypeScript"
- If memories already exist, merge — don't overwrite without asking
- All memories get `agent_id: "nemp-init"` and `tags: ["auto-detected"]`

## Error Handling

If no package.json found:
⚠️ No package.json found.
For Python/Rust/Go projects, save manually:
/nemp:save stack Python + FastAPI + PostgreSQL
/nemp:save framework FastAPI with SQLAlchemy
