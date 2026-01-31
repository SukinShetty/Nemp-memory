<div align="center">

  <img src="assets/images/Nemp banner 2.png" alt="Nemp Memory Banner" width="100%"/>

  <br/>

  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td><img src="assets/logo/Nemp Logo.png" alt="Nemp Memory Logo" height="80"/></td>
      <td><h1>&nbsp;Nemp Memory</h1></td>
    </tr>
  </table>

  <p><strong>Smart memory for Claude Code</strong></p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
    <img src="https://img.shields.io/badge/Claude_Code-Compatible-blue.svg" alt="Claude Code">
  </p>
</div>

---

## The Problem

Every time you start a new Claude Code session, you repeat yourself.

**You waste 15-20 minutes every session re-explaining context.**

Nemp solves this. Once.

---

## What It Does

Nemp gives Claude Code three superpowers:

### Auto-Detection (`/nemp:init`)

Scans your project and remembers everything automatically.

**Example:**
```bash
/nemp:init

Scanning your project...

I found:
- Framework: Next.js 14 (App Router detected)
- Language: TypeScript (strict mode)
- Database: PostgreSQL via Prisma
- Auth: NextAuth.js
- Styling: Tailwind CSS
- Package Manager: npm

Saved 6 memories

Next time you ask Claude about this project,
I'll provide this context automatically!
```

**Why it matters:** One command. Your entire tech stack saved. Never explain it again.

---

### Smart Context Search (`/nemp:context`)

Find relevant memories instantly when you need them.

**Example:**
```bash
# You're working on authentication
/nemp:context auth

FOUND 3 MEMORIES MATCHING "auth"

  auth-provider [KEY MATCH]
  NextAuth.js with JWT strategy

  auth-tokens [VALUE MATCH]
  15min access tokens, 7day refresh tokens

  auth-middleware [KEY MATCH]
  Protects all /api routes except /auth/*

Found 3 memories

Quick actions:
  /nemp:recall auth-provider
  /nemp:context database
```

**Why it matters:** Zero searching through old conversations. Type one word, get all relevant context.

**How it works:**
- Searches both keys and values
- Expands keywords automatically ("auth" also searches: authentication, login, session, jwt, oauth...)
- Shows relevance (key match vs value match)
- Suggests related searches

---

### Proactive Suggestions (`/nemp:suggest`)

Nemp watches what you code and suggests memories to save.

**Example scenario:**
```bash
# You've been editing auth files for 30 minutes
# Nemp notices the pattern...

/nemp:suggest

NEMP MEMORY SUGGESTIONS
Based on your recent activity

Analyzed   45 activities
Found      3 suggestions

#1  auth-approach                        PRIORITY: HIGH

DRAFTED VALUE:
Authentication: JWT tokens in auth/ directory
Files: login.ts, session.ts, middleware.ts
Pattern: 15min access tokens, httpOnly cookies

WHY SUGGESTED:
You edited 3 auth files 7+ times in 30 minutes.
This pattern is worth remembering.

[1] Save   [E] Edit   [S] Skip
```

**Why it matters:** Nemp does the work for you. It notices patterns you might miss and drafts the memory content.

**What it detects:**
- Files edited frequently (3+ times = important file)
- Directories with lots of activity (auth/, api/, components/)
- New packages installed (npm install zod = suggests saving it)
- Command patterns (always run tests before commits)
- Time-based focus (30+ minutes on same area)

**How to use:**
```bash
/nemp:suggest              # Interactive - choose what to save
/nemp:suggest --auto       # Auto-save HIGH priority suggestions
```

---

## Auto-Capture (Background Intelligence)

Nemp can optionally track your work automatically.

**What it captures:**
```bash
# Enable auto-capture
/nemp:auto-capture on

# Now Nemp logs (in the background):
- Files you edit or create
- Commands you run (npm, git, etc.)
- Build/test/deploy activities

# View captured activity
/nemp:activity

Recent Activity:
  2026-01-31 14:23  Edit    src/auth/login.ts
  2026-01-31 14:25  Edit    src/auth/session.ts
  2026-01-31 14:27  Bash    npm test
  2026-01-31 14:30  Bash    git commit -m "Add JWT refresh"
```

**Privacy-first:**
- Disabled by default
- Stores locally in `.nemp/activity.log`
- Smart filtering (excludes node_modules, .git, logs)
- You control what gets captured
- Never sent anywhere

**Why it's useful:**
- Powers the `/nemp:suggest` feature
- Helps you remember what you worked on
- Tracks your development patterns

---

## All Commands

### Quick Start
```bash
/nemp:init                 # Auto-detect and save your stack
```

### Memory Management
```bash
/nemp:save <key> <value>   # Save a memory
/nemp:recall <key>         # Retrieve a memory
/nemp:list                 # List all memories
/nemp:forget <key>         # Delete a memory
```

### Global Memories (Cross-Project)
```bash
/nemp:save-global <key> <value>   # Save globally
/nemp:recall-global <key>          # Recall global memory
/nemp:list-global                  # List all global memories
```

### Smart Features
```bash
/nemp:context <query>      # Search memories by keyword
/nemp:suggest              # Get memory suggestions
/nemp:suggest --auto       # Auto-save suggestions
```

### Activity Tracking
```bash
/nemp:auto-capture on      # Enable background tracking
/nemp:auto-capture off     # Disable tracking
/nemp:auto-capture status  # Check status
/nemp:activity             # View activity log
```

---

## Installation

**Inside Claude Code:**
```bash
/plugin install https://github.com/SukinShetty/Nemp-memory
```

**Restart Claude Code, then verify:**
```bash
/nemp:list
```

---

## Real-World Examples

### Example 1: New Team Member Onboarding

**Sarah joins your project:**
```bash
# She runs once:
/nemp:init

# Now when she asks Claude:
"How does authentication work in this project?"

# Claude already knows (from Nemp's memory):
- Uses NextAuth.js
- JWT tokens (15min access, 7day refresh)
- Protected routes via middleware
- Custom signin page at /auth/signin
```

**Time saved:** 20 minutes of context gathering reduced to 0 seconds

---

### Example 2: Context Switching Between Projects

**Marcus works on 3 client projects:**
```bash
# Project A (E-commerce)
cd ~/client-a
/nemp:recall stack
# "Next.js, Stripe, PostgreSQL"

# Project B (SaaS)
cd ~/client-b
/nemp:recall stack
# "React, Supabase, Tailwind"

# No confusion. Each project has its own memory.
```

**Time saved:** 15 minutes per project switch reduced to instant context

---

### Example 3: Remembering Decisions

**During development:**
```bash
/nemp:save api-design "RESTful, not GraphQL - team decision on 2024-01-15"
/nemp:save error-handling "Use Zod for validation, return 400 with error codes"
/nemp:save deployment "Deploy preview on PR, production on merge to main"
```

**Two months later:**
```bash
/nemp:context api
# Instantly recalls: "RESTful, not GraphQL - team decision..."
```

**Time saved:** No digging through Slack, Notion, or old PRs

---

## Privacy & Security

- **100% Local:** All data stored in `.nemp/` folder (plain JSON)
- **No Telemetry:** Zero tracking, analytics, or phone-home
- **No Cloud:** Your data never leaves your machine
- **You Own It:** Delete `.nemp/` folder anytime
- **Open Source:** Audit the code yourself (MIT License)

**Where data lives:**
```
Project memories:  .nemp/memories.json (in your project)
Global memories:   ~/.nemp/memories.json (in your home folder)
Activity log:      .nemp/activity.log (in your project)
```

---

## Why Nemp?

**Other solutions:**
- Require cloud accounts
- Charge monthly fees
- Send your code context to their servers

**Nemp:**
- Works offline
- Costs nothing
- Keeps everything local

**Core principle:** Your code context is private. It should stay with you.

---

## How It Works

1. **Storage:** Simple JSON files in `.nemp/` folder
2. **Scope:** Project memories (local) + Global memories (cross-project)
3. **Intelligence:** Pattern detection via activity analysis
4. **Privacy:** Everything happens on your machine

**No magic. No cloud. Just smart local storage.**

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

**Ideas for contributors:**
- Add detection for more frameworks
- Improve memory suggestion algorithms
- Build export/import features
- Create integrations

---

## License

MIT © 2026 [Sukin Shetty](https://github.com/SukinShetty)

Open source. Use freely. No restrictions.

---

## Support

If Nemp saves you time, give it a star!

**Built for developers who are tired of repeating themselves.**
