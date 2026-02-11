---

name: nemp-memory

description: Persistent local memory for AI agents. Use when starting a new session, when the user mentions remembering something, when you need project context, when making architecture decisions, or when working with other agents on the same project.

---



\# Nemp Memory — Persistent Local Memory for Claude Code



You have access to a local memory system stored in `.nemp/` in the project root. Use it to persist context across sessions so users never have to repeat themselves.



\## When to Use This Skill



\- \*\*Session start\*\*: Always check for existing memories by reading `.nemp/memories.json`

\- \*\*Architecture decisions\*\*: Save decisions so future sessions know why

\- \*\*Stack detection\*\*: On first use, auto-detect the project stack and save it

\- \*\*User preferences\*\*: Save coding style, conventions, patterns the user prefers

\- \*\*Agent coordination\*\*: When working with other agents, save context they'll need



\## Memory Storage Format



Memories are stored in `.nemp/memories.json` as an array of objects with keys: key, value, tags, timestamp, source, agent\_id.



\## How to Save a Memory



Read `.nemp/memories.json`, add or update the entry, write back. Rules:

\- Compress values: remove filler words, keep under 200 chars

\- Use descriptive keys: auth-provider, database, styling-framework

\- Tag appropriately: stack, architecture, convention, preference, api

\- Track agent\_id: use "main" for single agent or your agent name

\- Upsert: if key exists, update it



\## How to Recall Memories



Search `.nemp/memories.json` with keyword expansion:

\- auth -> authentication, login, session, jwt, token, oauth

\- database -> db, postgres, mysql, sqlite, mongo, prisma, drizzle

\- styling -> css, tailwind, sass, scss, styled-components, shadcn

\- testing -> test, jest, vitest, cypress, playwright, e2e

\- deploy -> deployment, docker, vercel, netlify, aws, ci, cd



\## Auto-Detection (First Session)



Scan package.json, requirements.txt, pyproject.toml, go.mod, Cargo.toml, tsconfig.json, docker-compose.yml, .env to auto-detect stack. Save each with source: "auto-detect" and agent\_id: "nemp-init".



\## Access Logging



Log every operation to `.nemp/access.log` with timestamp, operation, key, and agent.



\## Critical Rules



1\. ALL data stays local. Never make network calls.

2\. Create `.nemp/` directory if it doesn't exist.

3\. Always read before write to avoid overwriting other agents' memories.

4\. Compress aggressively — keep values under 200 chars.

5\. Log every operation to `.nemp/access.log`.

6\. Regenerate `.nemp/MEMORY.md` after every write/delete.

