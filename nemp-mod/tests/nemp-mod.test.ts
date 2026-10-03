import { describe, expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On, RenderElement } from 'claude-code'

import {
  contradiction,
  findConflicts,
  parseStore,
  scoreMemory,
  selectMemories,
  serializeStore,
  tokenize,
  upsertEntry,
} from '../hooks/memory'

const CWD = 'C:/work/app'
const HOME = 'C:/Users/dev'
const PROJECT = `${CWD}/.nemp/memories.json`
const GLOBAL = `${HOME}/.nemp/memories.json`
const TOOL = 'mcp__nemp-mod__nemp_recall'
const LOGIN_PROMPT = 'How should I add a new API endpoint with login?'

const entry = (key: string, value: string, type = 'fact') => ({ key, value, type, tags: [] })

// Project store in the { memories: [...] } layout, global store as a key map.
const PROJECT_STORE = JSON.stringify({
  memories: [
    entry('api-style', 'REST for all public APIs; GraphQL was retired after the v2 migration', 'decision'),
    entry('auth-flow', 'JWT access tokens (15 min) plus refresh tokens (7 days) in httpOnly cookies', 'procedure'),
    entry('db-stack', 'PostgreSQL 16 via Prisma ORM; migrations live in prisma/migrations'),
    entry('test-runner', 'Vitest for unit tests, Playwright for e2e; run pnpm test before committing'),
    entry('deploy-target', 'Deploy to Fly.io from main via GitHub Actions'),
    { ...entry('old-orm', 'TypeORM for database access'), vitality: { state: 'extinct' } },
  ],
})
const GLOBAL_STORE = JSON.stringify({
  'pkg-manager': entry('pkg-manager', 'Always use pnpm, never npm or yarn', 'rule'),
  'style-css': entry('style-css', 'Tailwind only, no CSS modules'),
})

type World = {
  files: Record<string, string>
  contexts: (readonly string[] | undefined)[]
  toasts: string[]
  statuses: (string | undefined)[]
  /** Lines logged to the transcript (debug-only lines left out). */
  logs: string[]
}

type WorldOptions = {
  files?: Record<string, string>
  /** Stands in for reading a file, e.g. a slow disk. */
  read?: (path: string) => Promise<string>
}

/** The engine hands hooks native paths; the world keys files with forward slashes. */
const norm = (path: string) => path.replace(/\\/g, '/')

/** The engine beneath the plugin: a cwd, a home, files in memory, a prompt sink. */
function world(on: On, options: WorldOptions = {}): World {
  const files = options.files ?? { [PROJECT]: PROJECT_STORE, [GLOBAL]: GLOBAL_STORE }
  const w: World = { files, contexts: [], toasts: [], statuses: [], logs: [] }
  mock.env(on, { HOME })
  on('session.cwd', () => ({ value: CWD }))
  on('fs.exists', ($, e) => ({ value: norm(e.path) in w.files }))
  on('fs.read', async ($, e) => {
    if (options.read !== undefined) return { value: await options.read(norm(e.path)) }
    const text = w.files[norm(e.path)]
    return text === undefined ? { deny: `ENOENT ${e.path}` } : { value: text }
  })
  on('fs.write', ($, e) => {
    w.files[norm(e.path)] = e.text
    return { value: undefined }
  })
  on('ui.toast', ($, e) => {
    w.toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.status', ($, e) => {
    w.statuses.push(e.text)
    return { value: undefined }
  })
  on('ui.log', ($, e) => {
    if (e.to !== 'debug') w.logs.push(e.text)
    return { value: undefined }
  })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('prompt.submit', ($, e) => {
    w.contexts.push(e.context)
    return { text: e.text, context: e.context }
  })
  return w
}

const submit = ($: Engine, text: string) =>
  $.prompt.submit({ text, wait: false, origin: { kind: 'composer' } })

const startSession = ($: Engine) =>
  $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })

const runCommand = ($: Engine, command: string, args = '') =>
  $.command.run({
    command,
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

const PANE_PROPS = {
  title: 'Nemp',
  isFocused: true,
  bodyColumns: 80,
  placement: 'dock' as const,
  scroll: { offset: 0, bodyRows: 20 },
  view: {},
}

const mountPane = ($: Engine, surface: 'terminal' | 'desktop') =>
  $.ui.mount({ plugin: 'nemp-mod', surface, component: 'Pane', requestId: 'nemp', props: PANE_PROPS })

type Drawing = { findAll: (q: { type: string; text: RegExp }) => Promise<{ text: string }[]> }

/** The pane row (1-based) whose numbered title names the memory key. */
async function rowOf(ui: Drawing, key: string) {
  const titles = await ui.findAll({ type: 'Text', text: /^\d+\. / })
  const title = titles.find(t => t.text.endsWith(` ${key}`))
  if (title === undefined) throw new Error(`${key} is not in the pane`)
  return Number(title.text.split('.')[0])
}

describe('recall', () => {
  test('injects the relevant memories as context without touching the prompt text', async ($, on) => {
    const w = world(on)
    await startSession($)
    const result = await submit($, LOGIN_PROMPT)

    expect(result.text).toBe(LOGIN_PROMPT)
    const [block] = result.context ?? []
    expect(block).toContain('[api-style]')
    expect(block).toContain('[auth-flow]')
    expect(block).not.toContain('[deploy-target]')
    expect(block).not.toContain('[old-orm]') // extinct
    expect(w.statuses.at(-1)).toBe('Nemp · 7 memories · 2 recalled')
  })

  test('reads an array store and caps recall at five', async ($, on) => {
    const many = Array.from({ length: 8 }, (_, i) => entry(`api-rule-${i}`, `API rule number ${i}`))
    world(on, { files: { [PROJECT]: JSON.stringify(many), [GLOBAL]: GLOBAL_STORE } })
    const result = await submit($, 'api rule')
    const block = result.context?.[0] ?? ''

    expect(block.match(/^- /gm)).toHaveLength(5)
  })

  test('adds nothing for slash commands or prompts below the threshold', async ($, on) => {
    const w = world(on)
    on('command.run', () => ({ text: '' }))
    await submit($, '/nemp-pane')
    await submit($, 'hello there, nice weather')

    expect(w.contexts).toEqual([undefined, undefined])
    expect(w.toasts).toEqual([])
  })

  test('recalls on a word in the value when its synonym is the key (the live prompt)', async ($, on) => {
    // The wording of the store the live test failed on: "endpoints" is in the value, "api" in the key.
    const store = JSON.stringify([
      entry('api-style', 'REST for all public APIs; GraphQL retired, must not be used for new endpoints'),
      entry('auth-flow', 'JWT access tokens (15 min) + refresh tokens (7 days) in httpOnly cookies'),
      entry('style-css', 'Tailwind only, no CSS modules; design tokens in tailwind.config.ts'),
    ])
    const w = world(on, { files: { [PROJECT]: store } })
    const live = "How should I add a new endpoint? Just answer in a few lines, don't edit any files."
    const block = (await submit($, live)).context?.[0] ?? ''

    expect(block).toContain('[api-style]')
    expect(block).not.toContain('[auth-flow]')
    expect(block).not.toContain('[style-css]')
    expect(w.statuses.at(-1)).toBe('Nemp · 3 memories · 1 recalled')
  })

  test('function words such as "in" match nothing on their own', () => {
    const memories = parseStore(PROJECT_STORE).entries.map(e => ({ ...e, source: 'project' as const }))
    expect(memories.map(m => scoreMemory('in', m))).toEqual(memories.map(() => 0))
    expect(tokenize("don't edit in the files")).toEqual(['dont', 'edit', 'file'])
  })
})

describe('/nemp-debug', () => {
  test('is off by default and logs each recall to the transcript when on', async ($, on) => {
    const w = world(on)
    await submit($, LOGIN_PROMPT)
    expect(w.logs).toEqual([])

    expect((await runCommand($, 'nemp-debug', 'on')).text).toContain('debug is on')
    await submit($, LOGIN_PROMPT)
    await submit($, 'hello there, nice weather')
    // The engine adds "nemp-mod:" to every plugin log line, so the mod must not.
    expect(w.logs[0]).toMatch(/^recall n=2 of 7 top=\S+:0\.\d\d \S+:0\.\d\d$/)
    expect(w.logs[1]).toBe('recall n=0 of 7')

    expect((await runCommand($, 'nemp-debug', 'off')).text).toContain('debug is off')
    await submit($, LOGIN_PROMPT)
    expect(w.logs).toHaveLength(2)
    expect((await runCommand($, 'nemp-debug', 'maybe')).text).toBe('Usage: /nemp-debug on|off')
  })
})

describe('pane pin and drop', () => {
  test('draws score, source and numbered Pin/Drop on each surface', async ($, on) => {
    world(on)
    await submit($, LOGIN_PROMPT)

    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await mountPane($, surface)
      expect(await ui.find({ text: /api-style/ })).toBeDefined()
      expect(await ui.find({ text: /0\.\d\d · project/ })).toBeDefined()
      expect((await ui.find({ key: 'pin-1' }))?.props.hotkey).toBe('1')
      expect((await ui.find({ key: 'drop-1' }))?.props.hotkey).toBe('6')
      await ui.unmount()
    }
  })

  test('pinned memories are always injected and dropped ones never are', async ($, on) => {
    world(on)
    await submit($, LOGIN_PROMPT)

    const ui = await mountPane($, 'terminal')
    const pinRow = await rowOf(ui, 'auth-flow')
    const dropRow = await rowOf(ui, 'api-style')
    await ui.press({ key: `pin-${pinRow}` })
    await ui.press({ key: `drop-${dropRow}` })
    expect((await ui.find({ key: `pin-${pinRow}` }))?.props.label).toBe('Unpin')
    expect((await ui.find({ key: `drop-${dropRow}` }))?.props.label).toBe('Restore')
    await ui.unmount()

    const unrelated = await submit($, 'hello there, nice weather')
    expect(unrelated.context?.[0]).toContain('[auth-flow] (project, procedure, pinned)')

    const related = await submit($, 'add another REST API endpoint')
    expect(related.context?.[0] ?? '').not.toContain('[api-style]')
    expect(related.context?.[0]).toContain('[auth-flow]')

    const tool = await $.tool.call({ tool: TOOL, query: 'REST API style' })
    expect(String(tool.result)).not.toContain('[api-style]')
  })

  test('shows a visible Nemp title, with or without recalled memories', async ($, on) => {
    world(on)
    for (const prompt of ['hello there, nice weather', LOGIN_PROMPT]) {
      await submit($, prompt)
      const ui = await mountPane($, 'terminal')
      expect((await ui.find({ text: /^Nemp$/ }))?.props.bold).toBe(true)
      await ui.unmount()
    }
  })

  test('lists dropped memories in their own section, where Restore brings them back', async ($, on) => {
    world(on)
    await submit($, LOGIN_PROMPT)
    let ui = await mountPane($, 'terminal')
    await ui.press({ key: `drop-${await rowOf(ui, 'api-style')}` })
    await ui.unmount()

    // api-style is no longer recalled, so only the dropped section can restore it.
    const without = await submit($, 'add another REST API endpoint')
    expect(without.context?.[0] ?? '').not.toContain('[api-style]')
    ui = await mountPane($, 'terminal')
    expect(await ui.find({ text: /^Dropped this session$/ })).toBeDefined()
    expect(await ui.find({ text: /^api-style$/ })).toBeDefined()
    await ui.press({ key: 'restore-1' })
    expect(await ui.find({ text: /^Dropped this session$/ })).toBeUndefined()
    await ui.unmount()

    const restored = await submit($, 'add another REST API endpoint')
    expect(restored.context?.[0]).toContain('[api-style]')
  })

  test('/nemp-pane falls back to a band above the prompt when the pane is not placed', async ($, on) => {
    world(on)
    on('ui.open', () => ({ value: { isPlaced: false, reason: 'too narrow' } }))
    // The engine's own band, drawn once the plugin passes.
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
      const { Box } = $.ui.resolve(e)
      return h(Box, { key: 'engine-band' }) as RenderElement
    })
    await submit($, 'which database and orm do we use?')
    const out = await runCommand($, 'nemp-pane')
    expect(out.text).toContain('compact view')

    const band = await $.ui.mount({
      plugin: 'nemp-mod',
      surface: 'terminal',
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 10,
        bodyColumns: 100,
        scroll: { offset: 0, bodyRows: 10 },
        view: {},
      },
    })
    expect(await band.find({ text: /db-stack/ })).toBeDefined()
    await band.press({ key: 'drop-1' })
    expect((await band.find({ key: 'drop-1' }))?.props.label).toBe('Restore')
    await band.press({ key: 'close' })
    expect(await band.find({ key: 'close' })).toBeUndefined()
    expect(await band.find({ key: 'engine-band' })).toBeDefined()
  })
})

describe('nemp_recall tool', () => {
  test('searches memory with the query and limit', async ($, on) => {
    world(on)
    await startSession($)
    const found = String((await $.tool.call({ tool: TOOL, query: 'database migrations', limit: 1 })).result)

    expect(found).toContain('Found 1 Nemp memory for "database migrations":')
    const two = String((await $.tool.call({ tool: TOOL, query: 'api login', limit: 2 })).result)
    expect(two).toContain('Found 2 Nemp memories for')
    expect(found).toContain('[db-stack]')
    expect(found).not.toContain('[old-orm]')
  })

  test('says so when nothing matches or the query is empty', async ($, on) => {
    world(on)
    const none = await $.tool.call({ tool: TOOL, query: 'kubernetes helm charts' })
    const empty = await $.tool.call({ tool: TOOL, query: '  ' })

    expect(String(none.result)).toContain('No Nemp memories matched')
    expect(String(empty.result)).toContain('non-empty query')
  })
})

describe('never blocking a prompt', () => {
  test('passes the prompt through unchanged when recall takes over 2 seconds', async ($, on) => {
    const clock = mock.clock(on)
    const w = world(on, {
      read: async () => {
        await clock.sleep(5000)
        return PROJECT_STORE
      },
    })

    const pending = submit($, LOGIN_PROMPT)
    await clock.settle()
    await clock.advance(2000)
    const result = await pending

    expect(result.text).toBe(LOGIN_PROMPT)
    expect(result.context).toBeUndefined()
    expect(w.toasts).toEqual(['Nemp: recall took over 2s, so your prompt was sent without memories'])
    expect(w.statuses.at(-1)).toBe('Nemp · 0 memories · recall skipped (timeout)')
  })

  test('passes the prompt through unchanged when a store does not parse', async ($, on) => {
    const w = world(on, { files: { [PROJECT]: '{ not json' } })
    const result = await submit($, LOGIN_PROMPT)

    expect(result.text).toBe(LOGIN_PROMPT)
    expect(result.context).toBeUndefined()
    expect(w.toasts[0]).toContain('recall failed')
    expect(w.statuses.at(-1)).toBe('Nemp · 0 memories · recall skipped (error)')
  })

  test('a skipped recall replaces the earlier count instead of keeping it', async ($, on) => {
    const w = world(on)
    await submit($, LOGIN_PROMPT)
    expect(w.statuses.at(-1)).toBe('Nemp · 7 memories · 2 recalled')

    w.files[PROJECT] = '{ not json'
    await submit($, LOGIN_PROMPT)
    expect(w.statuses.at(-1)).toBe('Nemp · 7 memories · recall skipped (error)')
    const ui = await mountPane($, 'terminal')
    expect(await ui.find({ text: /No memories were injected/ })).toBeDefined()
    await ui.unmount()
  })
})

describe('capture', () => {
  const turn = (agentId?: string) => ({
    answer: 'We will use pnpm workspaces.',
    durationMs: 1000,
    isAborted: false,
    turnId: 't1',
    reason: 'answer' as const,
    ...(agentId === undefined ? {} : { agentId }),
  })

  test('is off by default, skips subagents, and saves decisions in the store layout when on', async ($, on) => {
    const clock = mock.clock(on, { now: Date.UTC(2026, 9, 3, 12) })
    const w = world(on)
    let forks = 0
    on('turn.complete', ($, e) => ({ text: e.answer }))
    on('model.fork', () => {
      forks += 1
      return {
        value: {
          isAnswered: true,
          text: '[{"key":"Monorepo Tool","value":"pnpm workspaces for the monorepo","type":"decision"}]',
          usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
        },
      }
    })

    await $.turn.complete(turn())
    await clock.advance(10)
    expect(forks).toBe(0)

    expect((await runCommand($, 'nemp-capture', 'on')).text).toContain('capture is on')
    await $.turn.complete(turn('agent-7'))
    await clock.advance(10)
    expect(forks).toBe(0)

    await $.turn.complete(turn())
    await clock.advance(10)
    expect(forks).toBe(1)

    const saved = JSON.parse(w.files[PROJECT] ?? '{}')
    expect(Array.isArray(saved.memories)).toBe(true) // wrapper layout kept
    expect(saved.memories).toHaveLength(7)
    expect(saved.memories[6]).toMatchObject({
      key: 'monorepo-tool',
      value: 'pnpm workspaces for the monorepo',
      type: 'decision',
      agent_id: 'main',
      projectPath: CWD,
    })
    expect(w.files[`${CWD}/.nemp/access.log`]).toContain('WRITE key=monorepo-tool agent=main chars=32')
    expect(w.toasts.at(-1)).toBe('Nemp saved: monorepo-tool')

    expect((await runCommand($, 'nemp-capture', 'off')).text).toContain('capture is off')
  })
})

describe('capture contradiction check (save.md 9b)', () => {
  const answer = (on: Parameters<typeof world>[0], decisions: object[]) => {
    on('turn.complete', ($, e) => ({ text: e.answer }))
    on('model.fork', () => ({
      value: {
        isAnswered: true,
        text: JSON.stringify(decisions),
        usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
      },
    }))
  }
  const turn = { answer: 'ok', durationMs: 1, isAborted: false, turnId: 't', reason: 'answer' as const }

  test('keeps both memories, links them under links.conflicts and names both keys', async ($, on) => {
    const clock = mock.clock(on)
    const w = world(on)
    answer(on, [{ key: 'db-engine', value: 'MySQL 8 via Prisma ORM', type: 'decision' }])
    await runCommand($, 'nemp-capture', 'on')
    await $.turn.complete(turn)
    await clock.advance(10)

    const saved: { key: string; value: string; links: { conflicts: string[] } }[] =
      JSON.parse(w.files[PROJECT] ?? '{}').memories
    const byKey = (k: string) => saved.find(m => m.key === k)
    expect(byKey('db-stack')?.value).toContain('PostgreSQL 16') // not overwritten
    expect(byKey('db-engine')?.links.conflicts).toEqual(['db-stack'])
    expect(byKey('db-stack')?.links.conflicts).toEqual(['db-engine'])
    expect(w.toasts).toEqual([
      'Nemp saved: db-engine',
      'Nemp: db-engine may conflict with db-stack (mysql vs postgres). Both kept; review with /nemp:recall.',
    ])
  })

  test('says so when a capture replaces an existing key\'s value', async ($, on) => {
    const clock = mock.clock(on)
    const w = world(on)
    answer(on, [{ key: 'deploy-target', value: 'Deploy to Vercel from main' }])
    await runCommand($, 'nemp-capture', 'on')
    await $.turn.complete(turn)
    await clock.advance(10)

    expect(w.toasts[1]).toContain('deploy-target replaced its earlier value "Deploy to Fly.io from main via GitHub Actions"')
  })

  test('different families, or agreeing values, are not conflicts', () => {
    const store = parseStore(PROJECT_STORE)
    expect(findConflicts({ key: 'api-versioning', value: 'Version REST APIs in the URL path' }, store.entries)).toEqual([])
    expect(findConflicts({ key: 'cache-store', value: 'Redis 7 for sessions' }, store.entries)).toEqual([])
    expect(contradiction('Always use pnpm', 'Never use npm or yarn')).toBe('pnpm vs npm/yarn')
    expect(contradiction('PostgreSQL 16 via Prisma', 'postgres 14')).toBe('postgres 16 vs 14')
    expect(contradiction('Always squash commits', 'Never squash commits')).toBe('always vs never')
  })
})

describe('scoring noise', () => {
  test('"One line only" and "session" no longer recall style-css', () => {
    const style = { ...entry('style-css', 'Tailwind only, no CSS modules; design tokens in tailwind.config.ts'), source: 'project' as const }
    const prompt = 'How should we cache session data? One line only.'
    expect(scoreMemory(prompt, style)).toBe(0)
    expect(tokenize(prompt)).toEqual(['cache', 'session', 'data', 'line'])
  })
})

describe('store layouts', () => {
  test('a write keeps the layout the file already uses', () => {
    const now = '2026-10-03T00:00:00Z'
    for (const text of ['[]', '{"memories": [], "version": 2}', '{}']) {
      const store = parseStore(text)
      const out = JSON.parse(serializeStore(upsertEntry(store, { key: 'a', value: 'b' }, { now, projectPath: null }).store))
      if (store.layout === 'array') expect(out[0].key).toBe('a')
      if (store.layout === 'wrapper') expect(out).toMatchObject({ version: 2, memories: [{ key: 'a' }] })
      if (store.layout === 'map') expect(out.a.value).toBe('b')
    }
  })

  test('an update keeps created and bumps update_count', () => {
    const store = parseStore(JSON.stringify({ k: { value: 'old', created: 'then', vitality: { update_count: 2 } } }))
    const { entry: saved, isUpdate } = upsertEntry(store, { key: 'k', value: 'new' }, { now: 'now', projectPath: null })
    expect(isUpdate).toBe(true)
    expect(saved).toMatchObject({ key: 'k', value: 'new', created: 'then', updated: 'now', vitality: { update_count: 3 } })
  })

  test('dropped memories never come back from selection', () => {
    const memories = parseStore(PROJECT_STORE).entries.map(e => ({ ...e, source: 'project' as const }))
    const found = selectMemories('api endpoint', memories, { limit: 5, pinned: [], dropped: ['project:api-style'] })
    expect(found.map(r => r.key)).not.toContain('api-style')
  })
})
