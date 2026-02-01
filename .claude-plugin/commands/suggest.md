---
description: "Analyze activity and suggest memories to save"
argument-hint: "[--auto]"
---

# /nemp:suggest

Intelligently suggest memories to save based on your recent work patterns.

## Usage
```bash
/nemp:suggest            # Analyze and show suggestions interactively
/nemp:suggest --auto     # Automatically save all suggestions
```

## Instructions

You are an intelligent pattern analyzer. Examine the user's recent activity and suggest valuable memories to save.

### Step 1: Read Activity Log

Read the activity log from `.nemp/activity.log` or `.nemp-pro/activity.log`.

If no activity log exists:
```
No Activity Log Found

Enable activity capture to get personalized suggestions:
  /nemp:auto-capture on

Or manually add memories:
  /nemp:save <key> <value>
  /nemp:init              # Auto-detect project stack
```

### Step 2: Parse and Analyze Patterns

Analyze the activity log entries to identify patterns:

**Pattern Detection Categories:**

| Category | Detection Method | Suggestion Type |
|----------|------------------|-----------------|
| **Hot Files** | Files edited 3+ times | `important-files` |
| **Core Modules** | Directories with most activity | `project-structure` |
| **Workflow Commands** | Repeated bash commands (git, npm, test) | `dev-workflow` |
| **Stack Signals** | File extensions + paths | `stack-hints` |
| **Testing Patterns** | Test commands + test file edits | `testing-workflow` |
| **Build Patterns** | Build/deploy commands | `build-workflow` |
| **New Dependencies** | npm/yarn/pnpm install commands | `new-packages` |

**Analysis Rules:**

```
FOR EACH activity entry:
  - Track file paths → count modifications per file
  - Track directories → identify hot zones (e.g., src/auth/, src/api/)
  - Track commands → identify workflow patterns
  - Track file types → detect stack usage
  - Track install commands → detect new dependencies (Rule 2)

THRESHOLDS:
  - File modified 3+ times → IMPORTANT FILE
  - Directory has 5+ file edits → CORE MODULE
  - Command run 3+ times → WORKFLOW PATTERN
  - Same file type in multiple edits → STACK SIGNAL
  - Any npm/yarn/pnpm/bun install → NEW DEPENDENCY (always suggest)
```

### Step 3: Smart Memory Drafting

For each suggestion, auto-generate a memory value that is concise, actionable, and useful for future sessions.

**Drafting Rules:**

1. **Be Specific** - Include actual file paths, command names, package versions
2. **Be Concise** - Keep under 200 characters when possible
3. **Be Actionable** - Write in a way that helps future Claude sessions
4. **Include Context** - Add brief explanations for non-obvious items

**Memory Value Templates:**

| Suggestion Type | Template | Example |
|-----------------|----------|---------|
| `important-files` | `Core files: {file1} ({purpose}), {file2} ({purpose})` | `Core files: src/auth/login.ts (auth logic), src/api/users.ts (user CRUD)` |
| `core-modules` | `Architecture: {dir1}/ ({purpose}), {dir2}/ ({purpose})` | `Architecture: src/auth/ (authentication), src/api/ (REST endpoints)` |
| `dev-workflow` | `Dev: {cmd1}, Test: {cmd2}, Build: {cmd3}` | `Dev: npm run dev, Test: npm test, Build: npm run build` |
| `testing-approach` | `Tests: {runner} in {location}, run with {command}` | `Tests: vitest in src/__tests__/, run with npm test` |
| `deploy-process` | `Deploy: {build_cmd} then {deploy_method}` | `Deploy: npm run build then vercel --prod` |
| `new-packages` | `Added: {pkg1} ({desc}), {pkg2} ({desc})` | `Added: zod (validation), react-query (data fetching)` |

**Example Drafts:**

```
DETECTED: File src/auth/login.ts edited 7 times
DRAFTED:  "Core auth file handling user login, token generation, and session creation"

DETECTED: npm install zod @tanstack/react-query
DRAFTED:  "Added zod (schema validation) and @tanstack/react-query (server state management)"

DETECTED: Commands npm test (5x), npm run dev (8x), git commit (4x)
DRAFTED:  "Workflow: dev server with 'npm run dev', test with 'npm test', commit frequently"

DETECTED: Directory src/components/ has 12 file edits
DRAFTED:  "UI components in src/components/ - Button, Modal, Form, Layout are most active"
```

**Intelligent Inference:**

When drafting, infer purpose from file/directory names:

| Pattern | Inferred Purpose |
|---------|------------------|
| `*/auth/*`, `*/login*`, `*/session*` | Authentication |
| `*/api/*`, `*/routes/*`, `*/endpoints/*` | API layer |
| `*/components/*`, `*/ui/*` | UI components |
| `*/hooks/*` | Custom React hooks |
| `*/utils/*`, `*/helpers/*`, `*/lib/*` | Utilities |
| `*/store/*`, `*/state/*` | State management |
| `*/types/*`, `*.d.ts` | Type definitions |
| `*/tests/*`, `*/__tests__/*`, `*.test.*` | Testing |
| `*/middleware/*` | Request middleware |
| `*/services/*` | Business logic |
| `*/models/*`, `*/entities/*` | Data models |
| `*/config/*`, `*.config.*` | Configuration |

**Quality Checks:**

Before finalizing a drafted memory:

```
CHECK 1: Is it under 200 characters? (Prefer concise)
CHECK 2: Does it contain specific names? (No vague references)
CHECK 3: Would it help a new session understand the project? (Useful)
CHECK 4: Is it different from existing memories? (No duplicates)
```

If a draft is too long, summarize:
```
BEFORE: "The authentication system uses src/auth/login.ts for handling user
        login requests, src/auth/register.ts for new user registration,
        src/auth/logout.ts for session termination, and src/middleware/auth.ts
        for protecting routes"

AFTER:  "Auth: login.ts (login), register.ts (signup), logout.ts (signout),
        middleware/auth.ts (route protection)"
```

### Step 4: Generate Suggestions

Based on analysis and smart drafting, create memory suggestions:

**Suggestion Types:**

1. **Important Files**
```
Suggestion: important-files
Value: The most frequently modified files in this project are:
  - src/auth/login.ts (7 edits)
  - src/api/users.ts (5 edits)
  - src/utils/helpers.ts (4 edits)
Reason: These files are central to your work and likely contain core logic.
```

2. **Project Structure**
```
Suggestion: core-modules
Value: Key directories: src/auth/ (auth logic), src/api/ (API routes),
       src/components/ (UI components)
Reason: These directories show the most activity and likely represent
       the project's architecture.
```

3. **Development Workflow**
```
Suggestion: dev-workflow
Value: Common commands: npm test (before commits), git pull (daily),
       npm run dev (development)
Reason: These patterns reveal your preferred development workflow.
```

4. **Testing Patterns**
```
Suggestion: testing-approach
Value: Tests run with [vitest/jest], test files in [location],
       run tests with [command]
Reason: Consistent testing patterns detected.
```

5. **Build/Deploy**
```
Suggestion: deploy-process
Value: Build with [command], deploy via [method]
Reason: Repeated deployment commands detected.
```

6. **Stack Hints**
```
Suggestion: active-stack
Value: Active technologies: TypeScript (.ts files), React (components/),
       API routes (api/)
Reason: File patterns suggest this stack is actively used.
```

7. **New Dependencies** (Rule 2)
```
Suggestion: new-packages
Value: Recently installed packages:
  - zod (validation library)
  - @tanstack/react-query (data fetching)
  - lucide-react (icons)
Reason: These packages were installed during this session and are now
        part of your project stack.
```

### Step 5: Display Suggestions

Show suggestions in a beautiful, scannable format:

```
┌─────────────────────────────────────────────────────────────────┐
│  NEMP MEMORY SUGGESTIONS                                        │
│  Based on your recent activity patterns                         │
├─────────────────────────────────────────────────────────────────┤
│  Analyzed   45 activities                                       │
│  Period     2026-01-28 to 2026-01-30 (3 days)                   │
│  Found      4 suggestions                                       │
└─────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  #1  important-files                              PRIORITY: HIGH ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

   DRAFTED VALUE:
   ┌──────────────────────────────────────────────────────────────┐
   │ Core files: src/auth/login.ts (auth), src/api/users.ts      │
   │ (user CRUD), src/middleware/auth.ts (route protection)      │
   └──────────────────────────────────────────────────────────────┘

   DETECTED PATTERNS:
     src/auth/login.ts ............ 7 edits
     src/api/users.ts ............. 5 edits
     src/middleware/auth.ts ....... 4 edits

   WHY SUGGESTED:
   These files show concentrated activity and likely contain
   critical business logic worth remembering.

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  #2  new-packages                                 PRIORITY: HIGH ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

   DRAFTED VALUE:
   ┌──────────────────────────────────────────────────────────────┐
   │ Added: zod (validation), @tanstack/react-query (server       │
   │ state), lucide-react (icons)                                 │
   └──────────────────────────────────────────────────────────────┘

   DETECTED PATTERNS:
     npm install zod
     npm install @tanstack/react-query
     npm install lucide-react -D

   WHY SUGGESTED:
   New dependencies installed this session. Remembering these
   helps track your project's evolving stack.

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  #3  dev-workflow                               PRIORITY: MEDIUM ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

   DRAFTED VALUE:
   ┌──────────────────────────────────────────────────────────────┐
   │ Dev: npm run dev, Test: npm test, Build: npm run build       │
   └──────────────────────────────────────────────────────────────┘

   DETECTED PATTERNS:
     npm run dev ............... 8 runs
     npm test .................. 5 runs
     git commit ................ 4 runs

   WHY SUGGESTED:
   Consistent command usage reveals your development workflow.

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  #4  core-modules                               PRIORITY: MEDIUM ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

   DRAFTED VALUE:
   ┌──────────────────────────────────────────────────────────────┐
   │ Architecture: src/auth/ (authentication), src/api/          │
   │ (endpoints), src/components/ (UI)                            │
   └──────────────────────────────────────────────────────────────┘

   DETECTED PATTERNS:
     src/auth/ ................ 12 file edits
     src/api/ .................  8 file edits
     src/components/ ...........  6 file edits

   WHY SUGGESTED:
   These directories show the most activity and represent
   your project's core architecture.

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────────┐
│  SUMMARY                                                        │
├─────────────────────────────────────────────────────────────────┤
│  HIGH priority     2 suggestions (will auto-save with --auto)   │
│  MEDIUM priority   2 suggestions (will prompt for confirmation) │
│  LOW priority      0 suggestions                                │
├─────────────────────────────────────────────────────────────────┤
│  Ready to save? Select which memories to keep.                  │
└─────────────────────────────────────────────────────────────────┘
```

**Display Format Rules:**

1. **Header** - Shows analysis metadata (count, date range, suggestions found)
2. **Suggestion Cards** - Each suggestion in a bordered card with:
   - Number and key name
   - Priority badge (HIGH/MEDIUM/LOW)
   - Drafted value in a highlighted box
   - Detected patterns with counts
   - Brief explanation
3. **Summary Footer** - Breakdown by priority, next action prompt

**Priority Badges:**

| Priority | Display | Meaning |
|----------|---------|---------|
| HIGH | `PRIORITY: HIGH` | Auto-save with --auto, always recommend |
| MEDIUM | `PRIORITY: MEDIUM` | Prompt user, suggest saving |
| LOW | `PRIORITY: LOW` | Show but don't push |

**Compact Mode (for many suggestions):**

If more than 5 suggestions, use compact display:

```
┌─────────────────────────────────────────────────────────────────┐
│  NEMP MEMORY SUGGESTIONS (8 found)                              │
└─────────────────────────────────────────────────────────────────┘

  #   KEY                  PRIORITY   DRAFTED VALUE (preview)
  ─────────────────────────────────────────────────────────────────
  1   important-files      HIGH       Core files: src/auth/login.ts...
  2   new-packages         HIGH       Added: zod, react-query, lucide...
  3   dev-workflow         MEDIUM     Dev: npm run dev, Test: npm test...
  4   core-modules         MEDIUM     Architecture: src/auth/, src/api/...
  5   testing-approach     MEDIUM     Tests: vitest in __tests__/, run...
  6   auth-architecture    LOW        Auth flow: login.ts, register.ts...
  7   api-routes           LOW        Endpoints: /users, /posts, /auth...
  8   deploy-process       LOW        Deploy: npm build then vercel...

  ─────────────────────────────────────────────────────────────────
  HIGH: 2 | MEDIUM: 3 | LOW: 3

  View details: Enter suggestion number (1-8)
  Save all HIGH: --auto
```

**Color Hints (for terminal rendering):**

When outputting, use formatting that terminals can display:
- `**bold**` for key names and important text
- `---` separators for visual breaks
- Consistent indentation (2 spaces)
- Dotted leaders for alignment (file ... count)

**Multi-Suggestion Support (max 3 at once):**

When presenting suggestions interactively, show up to 3 at a time for easier decision-making:

```
┌─────────────────────────────────────────────────────────────────┐
│  SUGGESTIONS 1-3 of 6                                    Page 1/2 │
└─────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  [1] important-files                              PRIORITY: HIGH ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  Core files: src/auth/login.ts (auth), src/api/users.ts (CRUD)  ┃
┃  ─────────────────────────────────────────────────────────────  ┃
┃  Detected: 3 files edited 4+ times                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  [2] new-packages                                 PRIORITY: HIGH ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  Added: zod (validation), react-query (data), lucide (icons)    ┃
┃  ─────────────────────────────────────────────────────────────  ┃
┃  Detected: 3 npm install commands                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  [3] dev-workflow                               PRIORITY: MEDIUM ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  Dev: npm run dev, Test: npm test, Build: npm run build         ┃
┃  ─────────────────────────────────────────────────────────────  ┃
┃  Detected: 17 command runs across 3 patterns                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────────┐
│  ACTIONS                                                        │
├─────────────────────────────────────────────────────────────────┤
│  [1] [2] [3]  Select individual suggestions to save             │
│  [A] All      Save all 3 on this page                           │
│  [N] None     Skip all, go to next page                         │
│  [→] Next     View suggestions 4-6                              │
│  [Q] Quit     Exit without saving more                          │
└─────────────────────────────────────────────────────────────────┘
```

**Pagination Logic:**

```
TOTAL_SUGGESTIONS = count of all generated suggestions
PAGE_SIZE = 3
CURRENT_PAGE = 1

DISPLAY:
  Start index = (CURRENT_PAGE - 1) * PAGE_SIZE
  End index = min(Start index + PAGE_SIZE, TOTAL_SUGGESTIONS)

  Show suggestions[Start:End]
  Show "Page X/Y" indicator
  Show navigation if more pages exist
```

**Selection Handling:**

```
USER INPUT     ACTION
─────────────────────────────────────────────────────
1, 2, 3        Toggle individual suggestion selection
1,2 or 1 2     Select multiple at once
A or all       Select all on current page
N or none      Deselect all on current page
→ or next      Go to next page (saves selections)
← or prev      Go to previous page
S or save      Save all selected and exit
Q or quit      Exit (prompt if unsaved selections)
```

**After Each Page:**

When user navigates to next page, show running tally:

```
Selected so far: 2 memories (important-files, new-packages)

┌─────────────────────────────────────────────────────────────────┐
│  SUGGESTIONS 4-6 of 6                                    Page 2/2 │
└─────────────────────────────────────────────────────────────────┘
...
```

**Final Confirmation:**

After all pages reviewed or user presses Save:

```
┌─────────────────────────────────────────────────────────────────┐
│  SAVE CONFIRMATION                                              │
├─────────────────────────────────────────────────────────────────┤
│  You selected 4 memories to save:                               │
│                                                                 │
│    1. important-files     Core files: src/auth/login.ts...     │
│    2. new-packages        Added: zod, react-query, lucide...   │
│    3. dev-workflow        Dev: npm run dev, Test: npm test...  │
│    4. core-modules        Architecture: src/auth/, src/api/... │
│                                                                 │
│  Skipped 2 suggestions (testing-approach, deploy-process)       │
├─────────────────────────────────────────────────────────────────┤
│  [S] Save all 4    [E] Edit selections    [C] Cancel            │
└─────────────────────────────────────────────────────────────────┘
```

**Single Page Optimization:**

If 3 or fewer suggestions total, skip pagination:

```
IF TOTAL_SUGGESTIONS <= 3:
  Show all suggestions at once
  Show simple action bar: [1] [2] [3] [A]ll [N]one [S]ave
  No pagination needed
```

### Step 6: Handle User Response

**Interactive Mode (default):**

Use `AskUserQuestion` to let user choose which suggestions to save:

```
Which suggestions would you like to save?
  [ ] 1. important-files
  [ ] 2. dev-workflow
  [ ] 3. core-modules
  [ ] Save all
  [ ] Save none
```

For each selected suggestion, save it:
```bash
# Save to project memories
/nemp:save important-files "Core files: src/auth/login.ts, src/api/users.ts..."
```

**Auto Mode (--auto):**

If `--auto` flag is provided, automatically save all suggestions:

```
Auto-saving suggestions...

  Saved: important-files
  Saved: dev-workflow
  Saved: core-modules

3 memories saved from activity analysis.
```

### Step 7: Check for Existing Memories

Before saving, check if a memory with the same key exists:

```bash
# Read .nemp/memories.json to check for duplicates
```

If duplicate found:
```
Memory 'important-files' already exists.

Current value: "Core files: src/auth/login.ts"
New value: "Core files: src/auth/login.ts, src/api/users.ts, src/middleware/auth.ts"

[U] Update   [S] Skip   [K] Keep both (as important-files-2)
```

### Step 8: Completion Message

After saving:

```
Suggestions Applied

  Saved 3 new memories from activity patterns:
  - important-files
  - dev-workflow
  - core-modules

View your memories:
  /nemp:list              List all memories
  /nemp:recall <key>      View a specific memory

Keep capturing activity:
  /nemp:auto-capture on   Enable auto-capture
  /nemp:activity          View activity log
```

## Smart Detection Examples

### Example 1: Auth-Heavy Development

If activity shows many edits to auth files:
```
Activity detected: 12 edits to auth-related files
  - src/auth/login.ts (4)
  - src/auth/register.ts (3)
  - src/middleware/auth.ts (3)
  - src/auth/session.ts (2)

Suggestion: auth-architecture
Value: Authentication flow: login.ts handles login, register.ts for signup,
       session.ts for session management, auth.ts middleware validates all routes.
```

### Example 2: API Development

If activity shows API route work:
```
Activity detected: 8 edits to API routes
  - src/api/users.ts (3)
  - src/api/posts.ts (2)
  - src/api/auth.ts (3)

Suggestion: api-routes
Value: API endpoints: /api/users (CRUD), /api/posts (blog posts),
       /api/auth (authentication)
```

### Example 3: Testing Sprint

If activity shows heavy testing:
```
Activity detected: 15 test commands, 10 test file edits

Suggestion: testing-workflow
Value: Test runner: vitest
       Test location: src/__tests__/
       Run all tests: npm test
       Watch mode: npm test -- --watch
```

### Example 4: New Dependencies (Rule 2)

Detect package installations from Bash commands:

**Detection Patterns:**
```
INSTALL COMMANDS TO DETECT:
  npm install <package>
  npm i <package>
  npm add <package>
  yarn add <package>
  pnpm add <package>
  pnpm install <package>
  bun add <package>
  bun install <package>

EXTRACT:
  - Package name(s) from command
  - Dev dependency flag (-D, --save-dev)
  - Global flag (-g, --global) → skip these
```

**Activity Pattern:**
```json
{
  "tool": "Bash",
  "command": "npm",
  "details": "npm install zod @tanstack/react-query"
}
```

**Generated Suggestion:**
```
Activity detected: 3 package installations

Installed packages:
  - zod (npm install zod)
  - @tanstack/react-query (npm install @tanstack/react-query)
  - lucide-react (npm install lucide-react -D)

Suggestion: new-packages
Value: Recently added dependencies:
  - zod: Schema validation library
  - @tanstack/react-query: Server state management
  - lucide-react: Icon library (dev)

Why: These packages were just installed. Remembering them helps
     track your project's evolving dependencies.
```

**Smart Package Descriptions:**

When suggesting, try to identify what common packages do:

| Package | Auto-Description |
|---------|------------------|
| `zod` | Schema validation library |
| `@tanstack/react-query` | Server state & data fetching |
| `@tanstack/react-table` | Headless table component |
| `axios` | HTTP client |
| `lodash` | Utility functions |
| `date-fns` | Date manipulation |
| `lucide-react` | Icon library |
| `framer-motion` | Animation library |
| `react-hook-form` | Form handling |
| `@radix-ui/*` | Headless UI primitives |
| `tailwind-merge` | Tailwind class merging |
| `clsx` / `classnames` | Conditional CSS classes |
| `uuid` | UUID generation |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT handling |
| `prisma` | Database ORM |
| `drizzle-orm` | Database ORM |
| `next-auth` | Authentication |
| `@clerk/nextjs` | Authentication |
| `stripe` | Payment processing |
| `resend` | Email sending |
| `uploadthing` | File uploads |
| `@vercel/analytics` | Analytics |

For unknown packages, just list the package name without description.

**Dev vs Production Dependencies:**

Separate suggestions by dependency type:
```
Suggestion: new-packages
Value: Production dependencies:
  - zod (validation)
  - @tanstack/react-query (data fetching)

Suggestion: new-dev-packages
Value: Development dependencies:
  - @types/node (TypeScript types)
  - vitest (testing)
  - @playwright/test (E2E testing)
```

## Pattern Priority Matrix

| Activity Pattern | Memory Priority | Auto-save? |
|------------------|-----------------|------------|
| File edited 5+ times | HIGH | Yes |
| Command run 5+ times | HIGH | Yes |
| Directory with 10+ edits | HIGH | Yes |
| **New package installed** | **HIGH** | **Yes** |
| File edited 3-4 times | MEDIUM | Ask |
| Command run 3-4 times | MEDIUM | Ask |
| File edited 1-2 times | LOW | No |

## Empty/Low Activity Handling

If activity log has fewer than 5 entries:

```
Not Enough Activity for Suggestions

Your activity log has only 3 entries. Keep coding and run
/nemp:suggest again after more activity is captured.

In the meantime:
  /nemp:init              Auto-detect project stack
  /nemp:save <key> <val>  Manually save memories
  /nemp:auto-capture on   Enable auto-capture
```

---

## Advanced Pattern Analysis

### Activity Pattern Analysis

Detect these intelligent patterns from the activity log:

**1. File Frequency Analysis:**

```bash
# Count file edits by directory pattern
PATTERN DETECTION:

auth/*.ts → 8+ edits → Suggest "auth-approach" memory
  "Authentication: JWT tokens, session handling in auth/*.ts"

components/*.tsx → 12+ edits → Suggest "component-patterns" memory
  "UI Components: Reusable components in components/, uses React patterns"

api/*.ts → 5+ edits → Suggest "api-structure" memory
  "API Layer: REST endpoints in api/, handles user/post/auth routes"

lib/*.ts → 4+ edits → Suggest "utilities" memory
  "Utilities: Shared helpers in lib/, includes formatting and validation"

hooks/*.ts → 3+ edits → Suggest "custom-hooks" memory
  "React Hooks: Custom hooks in hooks/, manages state and side effects"
```

**2. Time-Based Patterns:**

```bash
# Analyze timestamps in activity log
DETECTION LOGIC:

FOR each file in activity_log:
  first_edit = earliest timestamp for this file
  last_edit = latest timestamp for this file
  duration = last_edit - first_edit

  IF duration > 30 minutes:
    → This file received sustained attention
    → HIGH priority for memory suggestion
    → Include in "focus-areas" memory

  IF multiple files in same directory edited within 1 hour:
    → User is working on a feature/module
    → Suggest module-level memory

EXAMPLE OUTPUT:
  "Focus session detected: 45 minutes on auth module"
  "Files touched: login.ts, session.ts, middleware.ts"
  → Suggest: "auth-session-flow" memory
```

**3. Dependency Change Detection:**

```bash
# Monitor package.json changes and install commands
DETECTION:

IF activity includes "Edit package.json":
  # Parse before/after to detect new dependencies
  DIFF = compare old vs new dependencies

IF activity includes "npm install" / "yarn add" / "pnpm add":
  PACKAGES = extract package names from command

# Cross-reference with file edits
IF installed "prisma" AND edited "prisma/*.ts":
  → Suggest: "database-orm: Using Prisma ORM with schema in prisma/"

IF installed "next-auth" AND edited "auth/*.ts":
  → Suggest: "auth-provider: NextAuth.js configured with [providers]"

IF installed "tailwindcss" AND edited "*.css" or "tailwind.config.*":
  → Suggest: "styling: Tailwind CSS with custom configuration"
```

**4. Command Pattern Recognition:**

```bash
# Identify workflow from repeated commands
PATTERNS TO DETECT:

git commit patterns:
  "git add . && git commit" (3+ times)
  → Suggest: "commit-style: Commits frequently, atomic changes"

test patterns:
  "npm test" before "git commit" (pattern detected)
  → Suggest: "workflow: Tests before commits (TDD approach)"

build patterns:
  "npm run build" → "npm run preview" (sequence)
  → Suggest: "build-process: Build then preview before deploy"

deploy patterns:
  "vercel" or "netlify deploy" or "git push origin main"
  → Suggest: "deploy-method: Deploys via [detected method]"
```

---

## Implementation Reference

### Core Analysis Logic

```bash
#!/bin/bash
# Reference implementation for pattern analysis

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1: Read and parse activity log
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVITY_FILE=".nemp/activity.log"
if [ ! -f "$ACTIVITY_FILE" ]; then
  echo "No activity log found. Run /nemp:auto-capture on"
  exit 1
fi

# Get last 100 entries (or all if fewer)
ACTIVITY=$(tail -n 100 "$ACTIVITY_FILE")
ENTRY_COUNT=$(echo "$ACTIVITY" | wc -l)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 2: Analyze file edit patterns
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Count edits by directory/pattern
AUTH_EDITS=$(echo "$ACTIVITY" | grep -iE "auth|login|session" | wc -l)
API_EDITS=$(echo "$ACTIVITY" | grep -E "api/|routes/" | wc -l)
COMPONENT_EDITS=$(echo "$ACTIVITY" | grep -E "components/|\.tsx" | wc -l)
DB_EDITS=$(echo "$ACTIVITY" | grep -iE "prisma|drizzle|database|schema" | wc -l)
TEST_EDITS=$(echo "$ACTIVITY" | grep -iE "test|spec|\.test\." | wc -l)

# Count command patterns
NPM_INSTALLS=$(echo "$ACTIVITY" | grep -E "npm install|yarn add|pnpm add" | wc -l)
GIT_COMMITS=$(echo "$ACTIVITY" | grep "git commit" | wc -l)
TEST_RUNS=$(echo "$ACTIVITY" | grep -E "npm test|vitest|jest" | wc -l)
BUILD_RUNS=$(echo "$ACTIVITY" | grep -E "npm run build|npm run dev" | wc -l)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 3: Generate suggestions based on thresholds
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

declare -a SUGGESTIONS

# Auth pattern detected
if [ $AUTH_EDITS -gt 3 ]; then
  SUGGESTIONS+=("auth-approach|HIGH|Authentication logic with $AUTH_EDITS file edits")
fi

# API pattern detected
if [ $API_EDITS -gt 3 ]; then
  SUGGESTIONS+=("api-structure|HIGH|API routes with $API_EDITS file edits")
fi

# Database pattern detected
if [ $DB_EDITS -gt 2 ]; then
  SUGGESTIONS+=("database-setup|HIGH|Database/ORM with $DB_EDITS file edits")
fi

# Component pattern detected
if [ $COMPONENT_EDITS -gt 5 ]; then
  SUGGESTIONS+=("component-patterns|MEDIUM|UI components with $COMPONENT_EDITS edits")
fi

# Testing pattern detected
if [ $TEST_EDITS -gt 3 ] || [ $TEST_RUNS -gt 3 ]; then
  SUGGESTIONS+=("testing-workflow|MEDIUM|Testing setup with $TEST_RUNS test runs")
fi

# New packages detected
if [ $NPM_INSTALLS -gt 0 ]; then
  PACKAGES=$(echo "$ACTIVITY" | grep -oE "npm install [^|]+" | head -3)
  SUGGESTIONS+=("new-packages|HIGH|Installed packages: $PACKAGES")
fi

# Dev workflow detected
if [ $BUILD_RUNS -gt 2 ]; then
  SUGGESTIONS+=("dev-workflow|MEDIUM|Development workflow with $BUILD_RUNS build/dev runs")
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 4: Display suggestions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "┌─────────────────────────────────────────────────────────────┐"
echo "│  NEMP MEMORY SUGGESTIONS                                    │"
echo "│  Analyzed $ENTRY_COUNT activities                           │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

COUNT=1
for suggestion in "${SUGGESTIONS[@]}"; do
  KEY=$(echo "$suggestion" | cut -d'|' -f1)
  PRIORITY=$(echo "$suggestion" | cut -d'|' -f2)
  DESC=$(echo "$suggestion" | cut -d'|' -f3)

  echo "[$COUNT] $KEY ($PRIORITY)"
  echo "    $DESC"
  echo ""
  ((COUNT++))
done

echo "Found ${#SUGGESTIONS[@]} suggestions"
```

---

## Smart Content Extraction

### Drafting Logic with File Analysis

When generating memory values, extract actual content from files to create meaningful drafts:

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SMART DRAFTING: Extract real patterns from source files
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

draft_auth_memory() {
  local DRAFT=""

  # Check for auth-related files and extract patterns
  if [ -d "src/auth" ] || [ -d "auth" ]; then
    AUTH_DIR=$([ -d "src/auth" ] && echo "src/auth" || echo "auth")

    # Detect auth method
    if grep -rq "jwt\|jsonwebtoken" "$AUTH_DIR" 2>/dev/null; then
      DRAFT+="JWT tokens, "
    fi
    if grep -rq "session" "$AUTH_DIR" 2>/dev/null; then
      DRAFT+="session-based, "
    fi
    if grep -rq "oauth\|OAuth" "$AUTH_DIR" 2>/dev/null; then
      DRAFT+="OAuth integration, "
    fi
    if grep -rq "bcrypt\|argon" "$AUTH_DIR" 2>/dev/null; then
      DRAFT+="password hashing, "
    fi

    # List main auth files
    FILES=$(ls "$AUTH_DIR"/*.ts 2>/dev/null | xargs -n1 basename | head -4 | tr '\n' ', ')
    DRAFT+="files: $FILES"
  fi

  echo "Auth approach: ${DRAFT%, }"
}

draft_api_memory() {
  local DRAFT=""

  # Find API directory
  API_DIR=""
  [ -d "src/api" ] && API_DIR="src/api"
  [ -d "app/api" ] && API_DIR="app/api"
  [ -d "pages/api" ] && API_DIR="pages/api"

  if [ -n "$API_DIR" ]; then
    # Count endpoints
    ENDPOINT_COUNT=$(find "$API_DIR" -name "*.ts" -o -name "*.js" | wc -l)

    # Detect API style
    if [ -d "app/api" ]; then
      DRAFT+="Next.js App Router API, "
    elif [ -d "pages/api" ]; then
      DRAFT+="Next.js Pages API, "
    fi

    # List main routes
    ROUTES=$(ls "$API_DIR" 2>/dev/null | head -5 | tr '\n' ', ')
    DRAFT+="$ENDPOINT_COUNT endpoints, routes: $ROUTES"
  fi

  echo "API structure: ${DRAFT%, }"
}

draft_database_memory() {
  local DRAFT=""

  # Detect ORM
  if [ -f "prisma/schema.prisma" ]; then
    # Extract models from Prisma schema
    MODELS=$(grep "^model " prisma/schema.prisma | awk '{print $2}' | head -5 | tr '\n' ', ')
    DRAFT+="Prisma ORM, models: $MODELS"
  elif [ -f "drizzle.config.ts" ]; then
    DRAFT+="Drizzle ORM, "
  fi

  # Detect database from env or config
  if grep -q "postgresql\|postgres" .env* 2>/dev/null; then
    DRAFT+="PostgreSQL"
  elif grep -q "mysql" .env* 2>/dev/null; then
    DRAFT+="MySQL"
  elif grep -q "sqlite" .env* 2>/dev/null; then
    DRAFT+="SQLite"
  fi

  echo "Database: ${DRAFT%, }"
}

draft_packages_memory() {
  local DRAFT=""

  # Extract recently installed packages from activity
  PACKAGES=$(grep -oE "(npm install|yarn add|pnpm add) [^|]+" .nemp/activity.log | \
             tail -5 | \
             sed 's/npm install //g; s/yarn add //g; s/pnpm add //g' | \
             tr '\n' ', ')

  echo "Added: ${PACKAGES%, }"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# USAGE: Call appropriate drafter based on suggestion type
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

generate_draft() {
  local SUGGESTION_TYPE=$1

  case $SUGGESTION_TYPE in
    auth-approach)
      draft_auth_memory
      ;;
    api-structure)
      draft_api_memory
      ;;
    database-setup)
      draft_database_memory
      ;;
    new-packages)
      draft_packages_memory
      ;;
    *)
      echo "Pattern detected in recent activity"
      ;;
  esac
}
```

### Intelligent Content Inference

```
FILE CONTENT → MEMORY DRAFT MAPPING:

┌─────────────────────────────────────────────────────────────────┐
│ DETECTED IN FILES              │ GENERATED DRAFT               │
├────────────────────────────────┼───────────────────────────────┤
│ import { jwt } from            │ "Uses JWT for auth tokens"    │
│ bcrypt.hash(password           │ "Bcrypt password hashing"     │
│ prisma.user.findUnique         │ "Prisma ORM for data access"  │
│ useQuery, useMutation          │ "React Query for server state"│
│ zod.object({ email:            │ "Zod schema validation"       │
│ export async function GET      │ "Next.js API route handlers"  │
│ middleware(request             │ "Custom middleware layer"     │
│ getServerSession               │ "Server-side sessions"        │
└────────────────────────────────┴───────────────────────────────┘
```

---

## User Response Handling

### Interactive Selection Flow

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HANDLE USER SELECTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handle_selection() {
  local SUGGESTIONS=("$@")
  local SELECTED=()

  echo ""
  echo "Select suggestions to save:"
  echo "  [1-${#SUGGESTIONS[@]}] Individual numbers"
  echo "  [1,2,3] or [1 2 3] Multiple selections"
  echo "  [A]ll - Save all suggestions"
  echo "  [N]one - Skip all"
  echo "  [E]dit - Modify a draft before saving"
  echo "  [Q]uit - Cancel"
  echo ""

  read -p "Your choice: " CHOICE

  case $CHOICE in
    # Single number
    [1-9])
      if [ $CHOICE -le ${#SUGGESTIONS[@]} ]; then
        SELECTED+=($CHOICE)
        save_suggestions "${SELECTED[@]}"
      else
        echo "Invalid selection"
      fi
      ;;

    # Multiple numbers (comma or space separated)
    *,* | *\ *)
      # Parse comma or space-separated numbers
      IFS=', ' read -ra NUMS <<< "$CHOICE"
      for num in "${NUMS[@]}"; do
        if [[ $num =~ ^[0-9]+$ ]] && [ $num -le ${#SUGGESTIONS[@]} ]; then
          SELECTED+=($num)
        fi
      done
      save_suggestions "${SELECTED[@]}"
      ;;

    # All
    [Aa] | all | ALL)
      for i in $(seq 1 ${#SUGGESTIONS[@]}); do
        SELECTED+=($i)
      done
      save_suggestions "${SELECTED[@]}"
      ;;

    # None
    [Nn] | none | NONE)
      echo "Skipped all suggestions."
      echo "Run /nemp:suggest again anytime!"
      ;;

    # Edit before save
    [Ee] | edit | EDIT)
      read -p "Which suggestion to edit? [1-${#SUGGESTIONS[@]}]: " EDIT_NUM
      edit_and_save $EDIT_NUM
      ;;

    # Quit
    [Qq] | quit | QUIT)
      echo "Cancelled. No memories saved."
      ;;

    *)
      echo "Invalid choice. Please try again."
      handle_selection "${SUGGESTIONS[@]}"
      ;;
  esac
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SAVE SELECTED SUGGESTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

save_suggestions() {
  local SELECTIONS=("$@")
  local SAVED=0
  local SKIPPED=0

  echo ""
  echo "Saving memories..."
  echo ""

  for idx in "${SELECTIONS[@]}"; do
    KEY="${SUGGESTION_KEYS[$idx-1]}"
    VALUE="${SUGGESTION_VALUES[$idx-1]}"

    # Check if already exists
    if memory_exists "$KEY"; then
      echo "  ⚠ $KEY already exists"
      read -p "    [U]pdate / [S]kip / [K]eep both? " ACTION
      case $ACTION in
        [Uu]) update_memory "$KEY" "$VALUE"; ((SAVED++)) ;;
        [Kk]) save_memory "${KEY}-2" "$VALUE"; ((SAVED++)) ;;
        *) ((SKIPPED++)) ;;
      esac
    else
      save_memory "$KEY" "$VALUE"
      echo "  ✓ Saved: $KEY"
      ((SAVED++))
    fi
  done

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Done! Saved $SAVED memories, skipped $SKIPPED"
  echo "  View with: /nemp:list"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EDIT BEFORE SAVING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

edit_and_save() {
  local IDX=$1
  local KEY="${SUGGESTION_KEYS[$IDX-1]}"
  local VALUE="${SUGGESTION_VALUES[$IDX-1]}"

  echo ""
  echo "Editing: $KEY"
  echo "Current draft:"
  echo "  $VALUE"
  echo ""
  read -p "New value (or Enter to keep): " NEW_VALUE

  if [ -n "$NEW_VALUE" ]; then
    VALUE="$NEW_VALUE"
  fi

  save_memory "$KEY" "$VALUE"
  echo "✓ Saved: $KEY"
}
```

### Auto Mode Handling

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AUTO MODE: Save all HIGH priority suggestions automatically
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$1" == "--auto" ]; then
  echo "Auto-saving HIGH priority suggestions..."
  echo ""

  for i in "${!SUGGESTIONS[@]}"; do
    PRIORITY=$(echo "${SUGGESTIONS[$i]}" | cut -d'|' -f2)

    if [ "$PRIORITY" == "HIGH" ]; then
      KEY=$(echo "${SUGGESTIONS[$i]}" | cut -d'|' -f1)
      VALUE=$(generate_draft "$KEY")

      save_memory "$KEY" "$VALUE"
      echo "  ✓ Auto-saved: $KEY"
    fi
  done

  echo ""
  echo "Done! Run /nemp:list to see saved memories."
  echo "Run /nemp:suggest (without --auto) for MEDIUM priority items."
  exit 0
fi
```

---

## Proactive Intelligence

### What Makes Nemp Smart

```
┌─────────────────────────────────────────────────────────────────┐
│  NEMP INTELLIGENCE PRINCIPLES                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. OBSERVANT                                                   │
│     Watches your activity without interrupting                  │
│     Builds understanding over time                              │
│                                                                 │
│  2. CONTEXTUAL                                                  │
│     Understands what files/patterns mean                        │
│     Infers purpose from names and content                       │
│                                                                 │
│  3. PROACTIVE                                                   │
│     Suggests before you ask                                     │
│     Identifies patterns you might miss                          │
│                                                                 │
│  4. RESPECTFUL                                                  │
│     Never saves without permission (unless --auto)              │
│     Easy to dismiss suggestions                                 │
│                                                                 │
│  5. HELPFUL                                                     │
│     Drafts are ready to save as-is                              │
│     Learns your project structure                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Suggestion Quality Checklist

Before presenting a suggestion, verify:

```
□ Is this pattern significant? (3+ occurrences)
□ Would this help a future session understand the project?
□ Is the drafted value specific and accurate?
□ Does this add value beyond what /nemp:init provides?
□ Is this different from existing memories?
```

### Future Enhancement Ideas

```
PLANNED IMPROVEMENTS:

1. Session-End Suggestions
   → Automatically run /nemp:suggest at session end
   → "Before you go, want to save these patterns?"

2. Confidence Scoring
   → Rate each suggestion 0-100% confidence
   → Only show suggestions above threshold

3. Learning from Dismissals
   → Track which suggestions user skips
   → Reduce similar suggestions over time

4. Cross-Session Patterns
   → Detect patterns across multiple sessions
   → "You always edit auth before tests"

5. Team Patterns (Global)
   → Suggest saving patterns to global memories
   → Share learnings across projects
```

## Related Commands

- `/nemp:activity` - View the activity log
- `/nemp:auto-capture` - Toggle activity capture
- `/nemp:init` - Auto-detect project stack
- `/nemp:save` - Manually save a memory
- `/nemp:list` - List all saved memories
