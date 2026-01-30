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

  <!-- Banner placeholder - add your banner image here -->

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
| 🎯 **Project Memory** | Save context specific to each project |
| 🌍 **Global Memory** | Save preferences that work everywhere |
| 🔒 **100% Local** | Your data never leaves your machine |
| ⚡ **Zero Setup** | No API keys, no accounts, no cloud |
| 🆓 **Free Forever** | No limits, no tiers, no payments |
| 📦 **Simple Commands** | `/nemp:save`, `/nemp:recall`, `/nemp:list` |

---

## 🚀 Quick Start

### Installation

```bash
# Clone and use
git clone https://github.com/SukinShetty/Nemp-memory.git
```

Or copy `.claude-plugin/` and `commands/` to your project root.

### Basic Usage

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

## 📚 Commands

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
│   └── plugin.json      # Plugin configuration
├── commands/
│   ├── save.md          # /nemp:save
│   ├── recall.md        # /nemp:recall
│   ├── list.md          # /nemp:list
│   ├── forget.md        # /nemp:forget
│   ├── save-global.md   # /nemp:save-global
│   ├── recall-global.md # /nemp:recall-global
│   └── list-global.md   # /nemp:list-global
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
