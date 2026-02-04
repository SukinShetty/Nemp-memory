---
description: "Auto-detect project stack and save as memories"
argument-hint: ""
---

# /nemp:init

Intelligently scan your project and auto-save context as memories.

## Instructions

You are an intelligent project analyzer. Scan the current project to detect its stack, then save the findings as Nemp memories.

### Step 1: Scan for project files

Check which configuration files exist:

```bash
[ -f "package.json" ] && echo "FOUND: package.json"
[ -f "tsconfig.json" ] && echo "FOUND: TypeScript config"
[ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ] && echo "FOUND: Next.js config"
[ -f "vite.config.ts" ] || [ -f "vite.config.js" ] && echo "FOUND: Vite config"
[ -f "nuxt.config.ts" ] && echo "FOUND: Nuxt config"
[ -f "astro.config.mjs" ] && echo "FOUND: Astro config"
[ -f "remix.config.js" ] && echo "FOUND: Remix config"
[ -f "svelte.config.js" ] && echo "FOUND: SvelteKit config"
[ -f "angular.json" ] && echo "FOUND: Angular config"
[ -f "requirements.txt" ] || [ -f "pyproject.toml" ] && echo "FOUND: Python project"
[ -f "Cargo.toml" ] && echo "FOUND: Rust project"
[ -f "go.mod" ] && echo "FOUND: Go project"
[ -f "Gemfile" ] && echo "FOUND: Ruby project"
[ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ] && echo "FOUND: Docker Compose"
[ -f "Dockerfile" ] && echo "FOUND: Dockerfile"
[ -f ".env" ] || [ -f ".env.local" ] || [ -f ".env.example" ] && echo "FOUND: Environment files"
```

### Step 2: Detect package manager

```bash
[ -f "package-lock.json" ] && echo "PACKAGE_MANAGER: npm"
[ -f "yarn.lock" ] && echo "PACKAGE_MANAGER: yarn"
[ -f "pnpm-lock.yaml" ] && echo "PACKAGE_MANAGER: pnpm"
[ -f "bun.lockb" ] && echo "PACKAGE_MANAGER: bun"
```

### Step 3: Parse package.json (if exists)

If package.json exists, read and analyze it:

```bash
cat package.json
```

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

### Step 4: Check framework-specific patterns

**For Next.js projects:**
```bash
[ -d "app" ] && echo "ROUTER: App Router (Next.js 13+)"
[ -d "pages" ] && echo "ROUTER: Pages Router"
[ -d "app/api" ] && echo "FEATURE: API Routes"
[ -d "src/app" ] && echo "STRUCTURE: src directory"
ls app/actions 2>/dev/null && echo "FEATURE: Server Actions"
```

**For monorepos:**
```bash
[ -f "turbo.json" ] && echo "MONOREPO: Turborepo"
[ -d "packages" ] && echo "STRUCTURE: packages directory"
[ -f "lerna.json" ] && echo "MONOREPO: Lerna"
[ -f "nx.json" ] && echo "MONOREPO: Nx"
```

**Check for UI components:**
```bash
[ -d "components/ui" ] && echo "UI: shadcn/ui components detected"
[ -d "src/components" ] && echo "STRUCTURE: components in src"
```

### Step 5: Read README.md for project description

If README.md exists, extract the first meaningful paragraph:
```bash
head -n 20 README.md
```

Use this to understand what the project does.

### Step 6: Check for environment variables

If .env.example or .env.local exists:
```bash
cat .env.example 2>/dev/null || cat .env.local 2>/dev/null | grep -v "^#" | grep "=" | cut -d'=' -f1
```

This shows what environment variables the project needs (without exposing values).

### Step 7: Display findings and confirm

Show the user a summary in this format:

```
╔══════════════════════════════════════════════════════════════╗
║                    🔍 NEMP PROJECT SCAN                      ║
╠══════════════════════════════════════════════════════════════╣
║  Project: [name from package.json]                           ║
║  Description: [from README or package.json]                  ║
╠══════════════════════════════════════════════════════════════╣
║  📦 Package Manager: [npm/yarn/pnpm/bun]                     ║
║  🔧 Language: [TypeScript/JavaScript]                        ║
║  ⚛️  Framework: [Next.js/React/Vue/etc]                       ║
║  🗄️  Database: [Prisma + PostgreSQL/etc]                      ║
║  🔐 Auth: [NextAuth/Clerk/etc]                               ║
║  🎨 Styling: [Tailwind/etc]                                  ║
║  🧪 Testing: [Vitest/Jest/etc]                               ║
╠══════════════════════════════════════════════════════════════╣
║  Detected patterns:                                          ║
║  • App Router with Server Components                         ║
║  • API routes in app/api                                     ║
║  • shadcn/ui components                                      ║
╚══════════════════════════════════════════════════════════════╝
```

### Step 8: Save memories

After showing the summary, save each finding as a memory. Only save what was actually detected.

**Required memories to save:**

1. **stack** - Complete tech stack summary
```
/nemp:save stack [Framework] with [Language], [Database], [Styling], [Auth]
```
Example: `/nemp:save stack Next.js 14 with TypeScript, Prisma + PostgreSQL, Tailwind CSS, NextAuth`

2. **framework** - Primary framework details
```
/nemp:save framework [Framework name and version if detectable, plus router type]
```
Example: `/nemp:save framework Next.js 14 using App Router with Server Components`

3. **database** - Database and ORM
```
/nemp:save database [ORM] with [Database]
```
Example: `/nemp:save database Prisma ORM with PostgreSQL`

4. **auth** - Authentication method
```
/nemp:save auth [Auth solution and any notable config]
```
Example: `/nemp:save auth NextAuth.js with Google and GitHub providers`

5. **styling** - Styling approach
```
/nemp:save styling [Styling solution and any UI library]
```
Example: `/nemp:save styling Tailwind CSS with shadcn/ui components`

6. **package-manager** - How to install/run
```
/nemp:save package-manager [manager] - use [manager] for all commands
```
Example: `/nemp:save package-manager pnpm - use pnpm for all install and run commands`

7. **testing** - Testing setup (if detected)
```
/nemp:save testing [Test framework and approach]
```
Example: `/nemp:save testing Vitest with React Testing Library`

8. **project-description** - What the project does
```
/nemp:save project-description [Brief description from README]
```

### Step 9: Check Auto-Sync Config (REQUIRED)

**IMPORTANT: This step is MANDATORY. Always check and execute auto-sync if enabled.**

After saving all memories, read the config file:
```bash
[ -f ".nemp/config.json" ] && cat .nemp/config.json
```

If `.nemp/config.json` exists and contains `"autoSync": true`:

**9a. Read all memories** from `.nemp/memories.json`

**9b. Group memories by category** using these rules:
- Keys containing "project", "workspace" → "Project Info"
- Keys containing "stack", "framework", "database", "auth", "styling", "testing", "package-manager" → "Tech Stack"
- Keys containing "feature", "command" → "Features"
- All other keys → "Other"

**9c. Generate CLAUDE.md content:**
```markdown
## Project Context (via Nemp Memory)

> Auto-generated by Nemp Memory. Last updated: [YYYY-MM-DD HH:MM]

### Project Info

| Key | Value |
|-----|-------|
| **project-name** | Project name here |

### Tech Stack

| Key | Value |
|-----|-------|
| **stack** | Next.js 14 with TypeScript... |
| **framework** | Next.js 14 using App Router |

---
```

**9d. Update CLAUDE.md:**
- If CLAUDE.md does NOT exist: Create it with the generated content
- If CLAUDE.md exists with `## Project Context (via Nemp Memory)`: Replace everything from that heading to the next `---` (inclusive)
- If CLAUDE.md exists without Nemp section: Append the generated content at the end

**9e. Set `syncPerformed = true`** for the completion message

### Step 10: Show completion message

After saving, display:

```
Nemp initialized! Saved [X] memories:

  • stack: Next.js 14 with TypeScript, Prisma + PostgreSQL...
  • framework: Next.js 14 using App Router...
  • database: Prisma ORM with PostgreSQL
  • auth: NextAuth.js with Google provider
  • styling: Tailwind CSS with shadcn/ui
  • package-manager: pnpm
  • testing: Vitest with React Testing Library
  • project-description: A SaaS starter kit for...

  ✓ CLAUDE.md synced    <-- only show if syncPerformed is true

Run /nemp:list to see all memories.
Run /nemp:recall stack to recall your tech stack anytime!
```

**If auto-sync is disabled or config doesn't exist:** Do not update CLAUDE.md, do not show the sync note.

## Important Notes

- Only save memories for things that were actually detected
- Be specific - "Next.js 14 with App Router" is better than just "Next.js"
- If unsure about something, note it (e.g., "PostgreSQL (detected from DATABASE_URL)")
- Don't overwrite existing memories without asking
- If memories already exist, show them and ask if user wants to update

## Error Handling

If no package.json is found:
```
⚠️ No package.json found. This doesn't look like a Node.js project.

Nemp can still help! Try:
  /nemp:save stack [describe your tech stack]
  /nemp:save language [Python/Go/Rust/etc]
```

If the project type is ambiguous, ask the user to clarify.
