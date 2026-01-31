<div align="center">

  <!-- Logo + Title on same line -->
  <table border="0" cellspacing="0" cellpadding="0" align="center">
    <tr>
      <td><img src="assets/logo/Nemp Logo.png" alt="Nemp Memory Logo" height="120"/></td>
      <td><h1>&nbsp;Nemp Memory</h1></td>
    </tr>
  </table>

  <!-- Tagline -->
  <p>
    <em>The memory plugin for Claude Code that remembers everything. 100% local. 100% free. 100% open source.</em>
  </p>

  <!-- Badges -->
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
    <a href="https://github.com/SukinShetty/Nemp-memory/stargazers"><img src="https://img.shields.io/github/stars/SukinShetty/Nemp-memory.svg" alt="Stars"></a>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/Claude_Code-Compatible-purple.svg" alt="Claude Code">
  </p>

  <!-- Banner -->
  <img src="assets/images/Nemp banner 2.png" alt="Nemp Memory Banner" width="100%"/>

  <br/>

  <!-- Call to Action -->
  <h3>Stop repeating yourself. Start remembering everything.</h3>

</div>

---

## 🎯 Why Nemp?

### The Problem

Using Claude Code, you constantly re-explain context:

- "Remember, I prefer TypeScript"
- "As I mentioned earlier, this uses JWT auth"
- "Like we discussed yesterday..."

**Claude forgets everything between sessions.** Every. Single. Time.

### The Solution

Nemp remembers FOR you:

- ✅ **Save once, recall forever**
- ✅ **Global memory across all projects**
- ✅ **Local storage (complete privacy)**
- ✅ **Zero setup required**

---

## ⚡ Features

| Feature | Description |
|---------|-------------|
| ✨ **Smart Init** | One command to auto-detect your entire tech stack! |
| 🤖 **Auto-Capture** | Automatically logs file edits, creations, and commands in the background. No manual saving needed! |
| 🎯 **Project Memory** | Save context specific to each project |
| 🌍 **Global Memory** | Save preferences that work everywhere |
| 🔒 **100% Local** | Your data never leaves your machine |
| ⚡ **Zero Setup** | No API keys, no accounts, no cloud |
| 🆓 **Free Forever** | No limits, no tiers, no payments |
| 📦 **Simple Commands** | `/nemp:save`, `/nemp:recall`, `/nemp:list` |

---

## 🚀 Installation

### Quick Install (Recommended)

```bash
# Step 1: Add the Nemp marketplace
/plugin marketplace add https://github.com/SukinShetty/Nemp-memory

# Step 2: Install the plugin
/plugin install nemp
```

That's it! You're ready to go.

### Alternative: Manual Installation

<details>
<summary>Click to expand manual installation options</summary>

#### Option A: Clone to your project

```bash
# In your project directory
git clone https://github.com/SukinShetty/Nemp-memory.git .nemp-plugin

# Copy plugin files to your project root
cp -r .nemp-plugin/.claude-plugin .
cp -r .nemp-plugin/commands .
cp -r .nemp-plugin/hooks .

# Clean up
rm -rf .nemp-plugin
```

#### Option B: Manual copy

1. Download or clone this repo
2. Copy these folders to your project root:
   - `.claude-plugin/`
   - `commands/`
   - `hooks/`

#### Option C: Global installation (all projects)

```bash
# Clone to Claude Code's plugin directory
git clone https://github.com/SukinShetty/Nemp-memory.git ~/.claude/plugins/nemp-memory
```

</details>

### Verify Installation

After installing, run:
```bash
/nemp:list
```

You should see an empty list (or existing memories if you've used Nemp before).

### Troubleshooting

**Commands not recognized:**
- Make sure you ran both `/plugin marketplace add` and `/plugin install nemp`
- Restart Claude Code after installation
- For manual installs: ensure `.claude-plugin/plugin.json` exists in your project root

**Permissions:**
Nemp needs filesystem access to create the `.nemp` folder in your projects.
You'll be prompted to allow this on first use.

---

## ✨ Magic Init (The WOW Feature!)

Just run one command and Nemp will scan your project and remember everything:

```bash
/nemp:init
```

**What it detects automatically:**
- 📦 Package manager (npm, yarn, pnpm, bun)
- 🔧 Language (TypeScript/JavaScript)
- ⚛️ Framework (Next.js, React, Vue, Remix, Astro, etc.)
- 🗄️ Database & ORM (Prisma, Drizzle, MongoDB, PostgreSQL, etc.)
- 🔐 Authentication (NextAuth, Clerk, Supabase Auth, etc.)
- 🎨 Styling (Tailwind, shadcn/ui, Chakra, etc.)
- 🧪 Testing (Vitest, Jest, Playwright, etc.)

**Example output:**
```
╔══════════════════════════════════════════════════════════════╗
║                    🔍 NEMP PROJECT SCAN                      ║
╠══════════════════════════════════════════════════════════════╣
║  📦 Package Manager: pnpm                                    ║
║  🔧 Language: TypeScript                                     ║
║  ⚛️  Framework: Next.js 14 (App Router)                       ║
║  🗄️  Database: Prisma + PostgreSQL                            ║
║  🔐 Auth: NextAuth.js                                        ║
║  🎨 Styling: Tailwind CSS + shadcn/ui                        ║
╚══════════════════════════════════════════════════════════════╝

✅ Saved 6 memories! Run /nemp:recall stack anytime.
```

---

## 📖 Basic Usage

```bash
# Save a memory
/nemp:save auth-method Uses JWT with refresh tokens

# Recall a memory
/nemp:recall auth-method

# List all memories
/nemp:list

# Forget a memory
/nemp:forget auth-method

# Save globally (works across ALL projects)
/nemp:save-global preferred-lang TypeScript over JavaScript always
```

---

## 🤖 Auto-Capture (Beta)

Nemp can automatically capture your development activities in the background!

### What gets captured:
- **File Edits** - When you modify files
- **File Creation** - When you create new files
- **Commands** - Git commits, npm/bun commands, tests, builds

### What gets excluded:
- Navigation commands (ls, cd, pwd)
- node_modules, .git, log files
- Internal operations

### How to use:

```bash
# Enable auto-capture
/nemp:auto-capture on

# Check status
/nemp:auto-capture status

# View captured activities
/nemp:activity

# View activity statistics
/nemp:activity --stats

# Disable auto-capture
/nemp:auto-capture off
```

> **Note:** Auto-capture is disabled by default. Enable it when you want Nemp to automatically remember your work!

---

## 📚 Commands

### Quick Start

| Command | Description | Example |
|---------|-------------|---------|
| `/nemp:init` | **Auto-detect project stack** | `/nemp:init` |

### Project Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/nemp:save <key> <value>` | Save project memory | `/nemp:save db-type PostgreSQL with Prisma` |
| `/nemp:recall <key>` | Recall memory | `/nemp:recall db-type` |
| `/nemp:list` | List all memories | `/nemp:list` |
| `/nemp:forget <key>` | Delete memory | `/nemp:forget db-type` |

### Global Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/nemp:save-global <key> <value>` | Save globally | `/nemp:save-global coding-style functional` |
| `/nemp:recall-global <key>` | Recall global | `/nemp:recall-global coding-style` |
| `/nemp:list-global` | List global memories | `/nemp:list-global` |

---

## 💾 How It Works

### Project Memory

Stored in `.nemp/memories.json` in your project:

```json
{
  "memories": [
    {
      "key": "auth-method",
      "value": "JWT with refresh tokens, 15min access, 7-day refresh",
      "created": "2026-01-30T10:30:00Z",
      "updated": "2026-01-30T10:30:00Z",
      "projectPath": "/path/to/project"
    }
  ]
}
```

### Global Memory

Stored in `~/.nemp/memories.json` (your home directory):

```json
{
  "memories": [
    {
      "key": "preferred-lang",
      "value": "TypeScript over JavaScript always",
      "created": "2026-01-30T10:30:00Z",
      "scope": "global"
    }
  ]
}
```

---

## 🧠 What Should You Save?

### Coding Preferences
```
/nemp:save-global style Use 2 spaces, single quotes, no semicolons
/nemp:save-global testing Jest with React Testing Library
/nemp:save-global typescript Always prefer TypeScript
```

### Project Architecture
```
/nemp:save auth JWT access tokens (15min) with refresh tokens (7 days)
/nemp:save database PostgreSQL with Prisma ORM
/nemp:save api REST with JSON:API specification
```

### Team Conventions
```
/nemp:save git-flow Feature branches, squash merge, require 1 approval
/nemp:save deploy Push to main triggers Vercel deploy
/nemp:save env-vars DATABASE_URL, STRIPE_KEY, RESEND_API_KEY required
```

---

## 🛡️ Privacy & Security

| | |
|---|---|
| ✅ **100% Local** | All data stored on your machine |
| ✅ **No Telemetry** | We don't track anything |
| ✅ **No Cloud** | Your data never leaves your computer |
| ✅ **No Accounts** | No sign-up, no login |
| ✅ **Offline Ready** | Works without internet |
| ✅ **Plain JSON** | Human-readable, easy to backup |

Your memories are YOUR memories.

---

## 📁 Project Structure

```
Nemp-memory/
├── .claude-plugin/
│   └── plugin.json       # Plugin configuration
├── commands/
│   ├── init.md           # /nemp:init (auto-detect stack!)
│   ├── save.md           # /nemp:save
│   ├── recall.md         # /nemp:recall
│   ├── list.md           # /nemp:list
│   ├── forget.md         # /nemp:forget
│   ├── save-global.md    # /nemp:save-global
│   ├── recall-global.md  # /nemp:recall-global
│   ├── list-global.md    # /nemp:list-global
│   ├── auto-capture.md   # /nemp:auto-capture
│   └── activity.md       # /nemp:activity
├── hooks/
│   ├── hooks.json        # Hook configuration
│   └── post-tool.md      # Auto-capture logic
├── LICENSE
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT © 2026 [Sukin Shetty](https://github.com/SukinShetty)

---

<div align="center">

**⭐ If Nemp makes your Claude Code experience better, give it a star!**

Made with ❤️ by [Sukin Shetty](https://github.com/SukinShetty)

[Report Bug](https://github.com/SukinShetty/Nemp-memory/issues) · [Request Feature](https://github.com/SukinShetty/Nemp-memory/issues)

</div>
