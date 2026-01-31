---
description: "Search memories by keyword and show relevant context"
argument-hint: "<search-query>"
---

# /nemp:context

Find and display memories relevant to a search query using smart keyword expansion.

## Usage
```bash
/nemp:context auth           # Find memories related to authentication
/nemp:context database       # Find database-related memories
/nemp:context api            # Find API-related memories
/nemp:context style          # Find styling/CSS memories
/nemp:context test           # Find testing-related memories
```

## Instructions

### 1. Get the Search Query
Extract the search term from the user's command argument.

If no argument provided, show help:
```
Nemp Context Search

Usage: /nemp:context <search-term>

Examples:
  /nemp:context auth      - Find authentication memories
  /nemp:context database  - Find database memories
  /nemp:context api       - Find API memories
  /nemp:context style     - Find styling/CSS memories
  /nemp:context test      - Find testing memories

Smart search expands your query to related terms!
```

### 2. Expand Keywords Using Smart Mappings

Based on the search term, expand to related keywords:

```
KEYWORD MAPPINGS:

auth, login, authentication:
  → auth, authentication, login, session, jwt, oauth, nextauth, clerk,
    supabase-auth, passport, token, credentials, signin, signup, logout

database, db:
  → database, db, postgres, postgresql, mysql, sqlite, mongo, mongodb,
    prisma, drizzle, mongoose, sequelize, knex, typeorm, schema, migration

api, endpoint:
  → api, endpoint, route, rest, graphql, trpc, fetch, axios, request,
    response, http, webhook, cors, middleware

style, css, styling:
  → style, css, tailwind, emotion, styled-components, chakra, mantine,
    theme, design, scss, sass, less, classname, styling

test, testing:
  → test, testing, jest, vitest, playwright, cypress, unit, integration,
    e2e, mock, fixture, assertion, coverage, spec

state, store:
  → state, store, redux, zustand, jotai, recoil, context, provider,
    reducer, action, selector, persist

deploy, hosting:
  → deploy, deployment, hosting, vercel, netlify, aws, docker, kubernetes,
    ci, cd, pipeline, github-actions, build

config, env, environment:
  → config, configuration, env, environment, dotenv, settings, options,
    variables, secrets, keys

error, debug:
  → error, debug, debugging, exception, catch, try, logging, sentry,
    bugsnag, stack, trace, console

types, typescript:
  → types, typescript, interface, type, generic, zod, yup, schema,
    validation, typing
```

### 3. Search Both Project and Global Memories

**Read memory files:**

```
Project memories: .nemp/memories.json
Global memories:  ~/.nemp/memories.json

Memory format:
{
  "key-name": "memory value content",
  "another-key": "another value"
}
```

Use the Read tool to load both files. Handle missing files gracefully.

### 4. Find Matching Memories

For each memory entry, perform case-insensitive matching:

```
For each (key, value) in memories:
  - Check if KEY contains any expanded keyword
  - Check if VALUE contains any expanded keyword
  - If match found, add to results with match type
```

**Match Priority:**
1. **Key exact match** - Key equals search term
2. **Key contains** - Key contains search term or expanded keyword
3. **Value contains** - Value contains search term or expanded keyword

### 5. Display Results

**When matches found:**

```
Context Search: "auth"

Expanded to: auth, authentication, login, session, jwt, oauth, nextauth...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT MEMORIES

  auth-config [KEY MATCH]
  ────────────────────────
  JWT authentication with refresh tokens. Access token expires
  in 15 minutes, refresh token in 7 days...

  api-routes [VALUE MATCH]
  ────────────────────────
  POST /api/login - User authentication
  POST /api/register - New user signup...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GLOBAL MEMORIES

  security-best-practices [VALUE MATCH]
  ────────────────────────────────────
  Always use bcrypt for password hashing. Implement rate
  limiting on auth endpoints...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found 3 memories (2 project, 1 global)

Quick actions:
  /nemp:recall auth-config    View full memory
  /nemp:save <key> <value>    Save new memory
```

**When no matches found:**

```
Context Search: "kubernetes"

Expanded to: kubernetes, k8s, helm, pod, container...

No matching memories found.

Suggestions:
  • Save relevant info: /nemp:save kubernetes "your notes here"
  • Try related terms: deploy, docker, hosting
  • List all memories: /nemp:list
```

### 6. Handle No Results Gracefully

When no memories match the search query, provide helpful guidance:

**Scenario A: No memories exist at all**
```
Context Search: "auth"

No memories saved yet!

Get started:
  /nemp:init              Auto-detect project and save context
  /nemp:save auth "..."   Save authentication notes
  /nemp:save-global ...   Save global preferences

Once you have memories, search will find them automatically.
```

**Scenario B: Memories exist but none match**
```
Context Search: "kubernetes"

Expanded to: kubernetes, k8s, helm, pod, container, cluster, node...

No matching memories found.

You have 5 memories saved. Try:
  • Broader terms: "deploy", "docker", "hosting"
  • List all: /nemp:list
  • Save new: /nemp:save kubernetes "your k8s notes"
```

**Scenario C: Memory files don't exist or are corrupted**
```
Context Search: "auth"

Could not read memories.

Troubleshooting:
  • Run /nemp:init to initialize project memories
  • Check if .nemp/memories.json exists
  • Ensure valid JSON format

Create memories:
  /nemp:save <key> <value>
```

**Smart Suggestions Based on Query:**

Map failed queries to helpful alternatives:
```
Query failed    →  Suggest trying
─────────────────────────────────────
kubernetes      →  deploy, docker, ci
graphql         →  api, endpoint, query
tailwind        →  style, css, theme
prisma          →  database, db, schema
vitest          →  test, testing, spec
zustand         →  state, store, redux
```

### 7. Smart Keyword Expansion

This is what makes `/nemp:context` INTELLIGENT!

When a user searches for "auth", don't just search for "auth" - automatically expand to ALL related terms:

```
User searches: "auth"
                 ↓
Smart expansion: auth, authentication, login, session, jwt,
                 oauth, nextauth, clerk, token, passport,
                 credentials, signin, signup, logout
                 ↓
Search ALL these terms against memories!
```

**Why this matters:**
- User saves memory as "jwt-config" → found when searching "auth"
- User saves memory as "login-flow" → found when searching "auth"
- User saves memory as "nextauth-setup" → found when searching "auth"

**The magic:** One search term finds ALL related memories!

```
┌─────────────────────────────────────────────────────────────┐
│  Search: "auth"                                             │
│                                                             │
│  ✓ Matches "auth-config"      (direct match)               │
│  ✓ Matches "jwt-tokens"       (jwt → auth family)          │
│  ✓ Matches "login-flow"       (login → auth family)        │
│  ✓ Matches "session-handling" (session → auth family)      │
│  ✓ Matches "oauth-setup"      (oauth → auth family)        │
│                                                             │
│  One search, ALL related results!                          │
└─────────────────────────────────────────────────────────────┘
```

### 8. Implementation Example

**Complete implementation logic:**

```bash
#!/bin/bash
# Smart Context Search Implementation

QUERY="$1"
QUERY_LOWER=$(echo "$QUERY" | tr '[:upper:]' '[:lower:]')

# ═══════════════════════════════════════════════════════════
# STEP 1: Smart Keyword Expansion
# ═══════════════════════════════════════════════════════════

case "$QUERY_LOWER" in
  auth|authentication|login|session|jwt|token)
    KEYWORDS="auth authentication login session jwt oauth nextauth clerk supabase-auth passport token credentials signin signup logout"
    CATEGORY="Authentication"
    ;;
  db|database|postgres|mysql|prisma)
    KEYWORDS="database db postgres postgresql mysql sqlite mongo mongodb prisma drizzle mongoose sequelize knex typeorm schema migration query table"
    CATEGORY="Database"
    ;;
  api|endpoint|route|rest)
    KEYWORDS="api endpoint route rest graphql trpc fetch axios request response http webhook cors middleware handler"
    CATEGORY="API"
    ;;
  style|css|tailwind|theme)
    KEYWORDS="style css tailwind emotion styled-components chakra mantine theme design scss sass less classname styling ui"
    CATEGORY="Styling"
    ;;
  test|testing|jest|vitest)
    KEYWORDS="test testing jest vitest playwright cypress unit integration e2e mock fixture assertion coverage spec describe"
    CATEGORY="Testing"
    ;;
  state|store|redux|zustand)
    KEYWORDS="state store redux zustand jotai recoil context provider reducer action selector persist global"
    CATEGORY="State Management"
    ;;
  deploy|hosting|vercel|docker)
    KEYWORDS="deploy deployment hosting vercel netlify aws docker kubernetes ci cd pipeline github-actions build release"
    CATEGORY="Deployment"
    ;;
  config|env|environment)
    KEYWORDS="config configuration env environment dotenv settings options variables secrets keys setup"
    CATEGORY="Configuration"
    ;;
  error|debug|log)
    KEYWORDS="error debug debugging exception catch try logging sentry bugsnag stack trace console log"
    CATEGORY="Error Handling"
    ;;
  type|types|typescript|interface)
    KEYWORDS="types typescript interface type generic zod yup schema validation typing infer"
    CATEGORY="TypeScript"
    ;;
  component|react|vue)
    KEYWORDS="component react vue svelte solid widget element render props children hook useState useEffect"
    CATEGORY="Components"
    ;;
  form|input|validation)
    KEYWORDS="form input validation submit field formik react-hook-form zod yup schema"
    CATEGORY="Forms"
    ;;
  cache|redis)
    KEYWORDS="cache caching redis memcached invalidate ttl store persist revalidate"
    CATEGORY="Caching"
    ;;
  *)
    # No expansion - use original query
    KEYWORDS="$QUERY_LOWER"
    CATEGORY="General"
    ;;
esac

# ═══════════════════════════════════════════════════════════
# STEP 2: Read Memory Files
# ═══════════════════════════════════════════════════════════

PROJECT_MEMORIES=".nemp/memories.json"
GLOBAL_MEMORIES="$HOME/.nemp/memories.json"

# Read project memories (if exists)
if [ -f "$PROJECT_MEMORIES" ]; then
  PROJECT_DATA=$(cat "$PROJECT_MEMORIES")
else
  PROJECT_DATA="{}"
fi

# Read global memories (if exists)
if [ -f "$GLOBAL_MEMORIES" ]; then
  GLOBAL_DATA=$(cat "$GLOBAL_MEMORIES")
else
  GLOBAL_DATA="{}"
fi

# ═══════════════════════════════════════════════════════════
# STEP 3: Search & Match
# ═══════════════════════════════════════════════════════════

# For each memory, check if KEY or VALUE contains any keyword
# Collect matches with their match type (KEY_MATCH or VALUE_MATCH)

PROJECT_MATCHES=()
GLOBAL_MATCHES=()

for keyword in $KEYWORDS; do
  # Search in keys and values (case-insensitive)
  # Add to matches array with match type
done

# ═══════════════════════════════════════════════════════════
# STEP 4: Sort Results (KEY matches first, then VALUE matches)
# ═══════════════════════════════════════════════════════════

# Sort by: KEY_MATCH > VALUE_MATCH
# Deduplicate results

# ═══════════════════════════════════════════════════════════
# STEP 5: Display Beautiful Output
# ═══════════════════════════════════════════════════════════

# (See display format in section 5)
```

**When user runs `/nemp:context auth`:**

```
Input:  "auth"
         ↓
Step 1: Expand to 15 related keywords
         ↓
Step 2: Load .nemp/memories.json + ~/.nemp/memories.json
         ↓
Step 3: Search all memories for any keyword match
         ↓
Step 4: Sort results (key matches first)
         ↓
Step 5: Display beautiful formatted output
```

**Example execution flow:**

```
$ /nemp:context auth

Reading memories...
  ✓ Project: .nemp/memories.json (8 entries)
  ✓ Global:  ~/.nemp/memories.json (3 entries)

Expanding "auth" → 15 keywords...
  auth, authentication, login, session, jwt, oauth,
  nextauth, clerk, token, passport, credentials...

Searching 11 memories...
  ✓ "jwt-config"     [KEY MATCH]   - contains "jwt"
  ✓ "api-routes"     [VALUE MATCH] - mentions "login"
  ✓ "security-tips"  [VALUE MATCH] - mentions "auth"

Displaying results...
```

## Full Keyword Expansion Table

| Search Term | Expanded Keywords |
|-------------|-------------------|
| `auth` | auth, authentication, login, session, jwt, oauth, nextauth, clerk, supabase-auth, passport, token, credentials, signin, signup, logout |
| `database` / `db` | database, db, postgres, postgresql, mysql, sqlite, mongo, mongodb, prisma, drizzle, mongoose, sequelize, knex, typeorm, schema, migration, query, table |
| `api` | api, endpoint, route, rest, graphql, trpc, fetch, axios, request, response, http, webhook, cors, middleware, handler |
| `style` / `css` | style, css, tailwind, emotion, styled-components, chakra, mantine, theme, design, scss, sass, less, classname, styling, ui |
| `test` | test, testing, jest, vitest, playwright, cypress, unit, integration, e2e, mock, fixture, assertion, coverage, spec, describe, it |
| `state` | state, store, redux, zustand, jotai, recoil, context, provider, reducer, action, selector, persist, global |
| `deploy` | deploy, deployment, hosting, vercel, netlify, aws, docker, kubernetes, ci, cd, pipeline, github-actions, build, release |
| `config` / `env` | config, configuration, env, environment, dotenv, settings, options, variables, secrets, keys, setup |
| `error` / `debug` | error, debug, debugging, exception, catch, try, logging, sentry, bugsnag, stack, trace, console, log |
| `types` / `typescript` | types, typescript, interface, type, generic, zod, yup, schema, validation, typing, infer |
| `component` | component, react, vue, svelte, solid, widget, element, render, props, children, hook |
| `route` / `page` | route, page, routing, navigation, link, redirect, params, query, path, url, navigate |
| `form` | form, input, validation, submit, field, formik, react-hook-form, zod, yup, schema |
| `cache` | cache, caching, redis, memcached, invalidate, ttl, store, persist, revalidate |

## Related Commands
- `/nemp:recall <key>` - View full memory content
- `/nemp:list` - List all memory keys
- `/nemp:save <key> <value>` - Save new memory
- `/nemp:list-global` - List global memories
