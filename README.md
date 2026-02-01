<div align="center">

  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td><img src="assets/logo/Nemp Logo.png" alt="Nemp Memory Logo" height="80"/></td>
      <td><h1>&nbsp;Nemp Memory</h1></td>
    </tr>
  </table>

  <p><strong>100% Local Memory for Claude Code • Privacy-First • Zero Setup</strong></p>

  <p>
    <img src="https://img.shields.io/badge/100%25-Local-brightgreen.svg" alt="100% Local">
    <img src="https://img.shields.io/badge/No_Cloud-Required-blue.svg" alt="No Cloud">
    <img src="https://img.shields.io/badge/No_API_Key-Needed-blue.svg" alt="No API Key">
    <img src="https://img.shields.io/badge/Privacy-First-purple.svg" alt="Privacy First">
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
  </p>

  <br/>

  <img src="assets/images/Nemp banner 2.png" alt="Nemp Memory Banner" width="100%"/>

</div>

---

## The Problem

Claude Code forgets everything between sessions. You waste 15-20 minutes every day re-explaining:
- Your tech stack
- Architecture decisions
- Project patterns
- What you worked on yesterday

**Other memory plugins exist, but they're complicated:**
- Require MCP servers, SQLite databases, or Ollama
- Need cloud accounts and API keys
- Send your code context to their servers
- Need 10+ steps to set up
- Come with web UIs you'll never use
- Store data in formats you can't easily read

---

## Why Nemp Is Different

**Nemp is stupidly simple:**

```bash
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
# Done.
```

**Zero dependencies. No cloud. No API keys. Plain JSON files. Just works.**

| Feature | Other Plugins | Nemp |
|---------|---------------|------|
| **Setup** | 10+ steps | **2 commands** |
| **Dependencies** | SQLite, Ollama, web servers | **None** |
| **Cloud Required** | Often yes | **No** |
| **API Key Required** | Often yes | **No** |
| **Data Storage** | Binary databases, cloud | **Plain JSON** |
| **Privacy** | Data may leave your machine | **100% Local** |
| **Auto-detect Stack** | No | **Yes** |
| **Proactive Suggestions** | No | **Yes** |
| **Works Offline** | Sometimes | **Always** |
| **Cost** | Free to $19/month | **Free Forever** |

---

## 3 Features That Set Nemp Apart

### 1️⃣ Auto-Init: One Command Learns Everything

**Unique to Nemp:** Auto-detects your entire stack in one command.

<p align="center">
  <img src="assets/demos/nemp-init-demo-optimized.gif" alt="Auto-init demo" width="100%"/>
</p>

```bash
/nemp:init
```

That's it. Nemp scans your project and automatically detects:
- Framework (Next.js, React, Vue, etc.)
- Language & config (TypeScript, strict mode)
- Database & ORM (Prisma, Drizzle, MongoDB)
- Auth solution (NextAuth, Clerk, Supabase)
- Styling (Tailwind, styled-components)
- Package manager (npm, yarn, pnpm, bun)

**Example output:**
```
Scanning your project...
I found:

Framework: Next.js 14 (App Router detected)
Language: TypeScript (strict mode enabled)
Database: PostgreSQL via Prisma
Auth: NextAuth.js
Styling: Tailwind CSS
Package Manager: npm

Saved 6 memories in 2 seconds
Claude now knows your stack forever.
```

**Why this matters:**
- New team members: Zero onboarding
- Context switching: Instant project recall
- No manual documentation needed

---

### 2️⃣ Smart Context: Find Memories Instantly

**Unique to Nemp:** Semantic search that understands what you're looking for.

<p align="center">
  <img src="assets/demos/nemp-context-demo.gif" alt="Smart context demo" width="100%"/>
</p>

```bash
/nemp:context auth
```

Nemp doesn't just search for "auth" — it expands to:
- authentication, login, session, jwt, oauth, nextauth, clerk, token, passport, credentials...

**Example output:**
```
FOUND 3 MEMORIES MATCHING "auth"

auth-provider [KEY MATCH]
  NextAuth.js with JWT strategy

auth-tokens [KEY + VALUE MATCH]
  15min access tokens, 7day refresh

auth-middleware [KEY MATCH]
  Protects all /api routes except /auth/*

Quick actions:
/nemp:recall auth-provider    # View details
/nemp:context database        # Search database
```

**Why this matters:**
- No scrolling through old chats
- Context appears in < 1 second
- Finds related memories automatically

---

### 3️⃣ Memory Suggestions: AI Suggests What to Save

**Unique to Nemp:** Nemp watches your work and proactively suggests memories.

<p align="center">
  <img src="assets/demos/nemp-suggest-demo-optimized.gif" alt="Memory suggestions demo" width="100%"/>
</p>

```bash
/nemp:suggest
```

**Example output:**
```
NEMP MEMORY SUGGESTIONS
Based on your recent activity patterns:

#1  auth-approach                              PRIORITY: HIGH

DRAFTED FOR YOU:
  Authentication: JWT tokens, 15min access,
  7day refresh. Files: login.ts, session.ts,
  middleware.ts in auth/ directory

WHY SUGGESTED:
You edited 3 auth files 7+ times in 30 minutes.
This pattern is worth remembering.

[1] Save  [E] Edit  [S] Skip
```

**What it detects:**
- Files edited frequently (3+ times)
- New packages installed (npm install)
- Directory patterns (auth/, api/, components/)
- Command patterns (test before commit)
- Time-based focus (30+ min sessions)

**Why this matters:**
- Nemp drafts memories FOR you
- Zero cognitive load
- Captures patterns you'd miss

---

## Installation

**Two commands:**

```bash
# Step 1: Add the marketplace
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory

# Step 2: Install the plugin
/plugin install nemp
```

**Verify it's working:**
```bash
/nemp:list
```

---

## Troubleshooting

### Commands not working?

**Step 1: Restart Claude Code**
```bash
exit
claude
```

**Step 2: Verify installation**
```bash
/plugin list
# Should show: nemp@nemp-memory
```

**Step 3: Clean reinstall**
```bash
/plugin uninstall nemp
/plugin marketplace remove nemp-memory
exit
claude
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory
/plugin install nemp
exit
claude
```

### Uninstalling Nemp

**Remove plugin:**
```bash
/plugin uninstall nemp
/plugin marketplace remove nemp-memory
```

**Delete all data (optional):**
```bash
# Delete project memories
rm -rf .nemp

# Delete global memories
rm -rf ~/.nemp
```

**Note:** Deleting `.nemp` folders removes ALL saved memories permanently.

### Still having issues?

1. Check Claude Code version (requires v2.0+)
2. Clear cache: `rm -rf ~/.claude/plugins/cache/nemp*`
3. [Open an issue on GitHub](https://github.com/SukinShetty/Nemp-memory/issues)

---

## Quick Commands

```bash
# Get Started
/nemp:init                    # Auto-detect stack (unique!)

# Basic Memory
/nemp:save <key> <value>      # Save memory
/nemp:recall <key>            # Get memory
/nemp:list                    # List all
/nemp:forget <key>            # Delete memory

# Smart Features
/nemp:context <keyword>       # Smart search (unique!)
/nemp:suggest                 # Get AI suggestions (unique!)
/nemp:suggest --auto          # Auto-save HIGH priority

# Global (Cross-Project)
/nemp:save-global <key> <value>
/nemp:list-global

# Activity (Optional)
/nemp:auto-capture on/off     # Enable tracking
/nemp:activity                # View log
```

---

## Real Use Cases

### Onboarding New Developers
```bash
# Day 1, new dev runs:
/nemp:init

# Claude instantly knows:
- Tech stack
- Database setup
- Auth approach
- Project structure

Time saved: 2 hours -> 2 seconds
```

---

### Context Switching Between Projects
```bash
# Project A
cd ~/client-a
/nemp:recall stack
-> "Next.js, Stripe, PostgreSQL"

# Project B
cd ~/client-b
/nemp:recall stack
-> "React, Supabase, Tailwind"

Each project remembers itself.
```

---

### Decision History
```bash
/nemp:save api-design "RESTful not GraphQL - team decision 2024-01-15"

# 3 months later:
/nemp:context api
-> Instant recall, no Slack archaeology
```

---

## Privacy & Storage

**Everything local. No cloud. No tracking.**

```
.nemp/
  memories.json          # Your project memories
  activity.log           # Activity tracking (optional)

~/.nemp/
  memories.json          # Global memories
```

**Human-readable JSON:**
```json
{
  "key": "auth-provider",
  "value": "NextAuth.js with JWT",
  "created": "2026-01-31T12:00:00Z"
}
```

**You own your data. Delete anytime:**
```bash
rm -rf .nemp
```

**Why privacy matters:**
- Your code contains business logic
- API keys and secrets in your context
- Competitive advantages in your architecture
- Compliance requirements (HIPAA, SOC2, etc.)

**Nemp keeps it all on your machine. Always.**

---

## Contributing

Want to add framework detection or improve suggestions?

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

**Popular requests:**
- Add Svelte/Angular detection
- Improve suggestion algorithms
- Build import/export features

---

## Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/SukinShetty/Nemp-memory/issues)
- **Email:** [contact@nemp.dev](mailto:contact@nemp.dev)
- **Discord:** Coming Soon

---

## License

MIT © 2026 [Sukin Shetty](https://github.com/SukinShetty)

Open source. Free forever. Use however you want.

---

## Support This Project

**Love Nemp? Here's how you can help:**

⭐ **[Star this repo](https://github.com/SukinShetty/Nemp-memory)** – Helps other developers discover Nemp
🐛 **[Report bugs](https://github.com/SukinShetty/Nemp-memory/issues)** – Make Nemp better for everyone
💡 **Share your use case** – Tweet [@sukin_s](https://x.com/sukin_s) with #NempMemory
🔀 **[Contribute code](CONTRIBUTING.md)** – See contributing guidelines

**Join the community:**
- 💬 Discord: *Coming Soon*
- 🐦 Twitter: [@sukin_s](https://x.com/sukin_s)
- 💼 LinkedIn: [Sukin Shetty](https://linkedin.com/in/sukinshetty-1984)

**Every star motivates us to build better features!**

---

<div align="center">
  <p>Built with care by <a href="https://www.linkedin.com/in/sukinshetty-1984/">Sukin Shetty</a></p>
  <p>
    <a href="https://www.linkedin.com/in/sukinshetty-1984/">LinkedIn</a> •
    <a href="https://x.com/sukin_s">X/Twitter</a> •
    <a href="mailto:contact@nemp.dev">contact@nemp.dev</a>
  </p>
  <br>
  <p><strong>Stop repeating yourself. Start coding faster.</strong></p>
</div>
