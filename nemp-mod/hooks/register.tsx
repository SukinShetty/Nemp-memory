import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { MemorySource, RecalledMemory } from '../types'
import {
  contextBlock,
  findConflicts,
  isExtinct,
  linkConflict,
  normalizeKey,
  parseCaptured,
  parseStore,
  selectMemories,
  serializeStore,
  upsertEntry,
} from './memory'
import type { Memory } from './memory'

const PANE = 'nemp'
const TOOL = 'mcp__nemp-mod__nemp_recall'
const RECALL_LIMIT = 5
const RECALL_TIMEOUT_MS = 2000
/** Capture toasts land after the turn, often while the person is reading it. */
const TOAST_MS = 8000

const lastRecalled = atom({ plugin: 'nemp-mod', key: 'lastRecalled' } as const, [])
const pinned = atom({ plugin: 'nemp-mod', key: 'pinned' } as const, [])
const dropped = atom({ plugin: 'nemp-mod', key: 'dropped' } as const, [])
const total = atom({ plugin: 'nemp-mod', key: 'total' } as const, 0)
const isCapturing = atom({ plugin: 'nemp-mod', key: 'isCapturing' } as const, false)
const isBandShown = atom({ plugin: 'nemp-mod', key: 'isBandShown' } as const, false)
const isDebug = atom({ plugin: 'nemp-mod', key: 'isDebug' } as const, false)

const CAPTURE_PROMPT = [
  "You are Nemp's memory capture step. Look only at the most recent user prompt and your reply to it.",
  'List at most 3 key decisions settled in that exchange that are worth remembering in later sessions:',
  'technology choices, conventions, rules, architecture decisions, or preferences the user stated.',
  'Skip anything tentative, trivial, already obvious from the code, or containing secrets or credentials.',
  'Reply with ONLY a JSON array and no prose, each item',
  '{"key": "kebab-case-key", "value": "concise fact under 200 characters", "type": "decision|rule|preference|fact|procedure"}.',
  'Reply [] when there is nothing worth saving.',
].join('\n')

const TIMED_OUT = Symbol('timed-out')

type Paths = { project: string; global: string | undefined; projectDir: string; cwd: string }

const slash = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '')

async function storePaths($: EngineInterface): Promise<Paths> {
  const cwd = slash(await $.session.cwd())
  const home = (await $.env.get('HOME')) ?? (await $.env.get('USERPROFILE'))
  const projectDir = `${cwd}/.nemp`
  const global = home === undefined ? undefined : `${slash(home)}/.nemp/memories.json`
  const project = `${projectDir}/memories.json`
  return { cwd, projectDir, project, global: global === project ? undefined : global }
}

/** Both stores, project first. A store that does not parse rejects. */
async function loadMemories($: EngineInterface): Promise<Memory[]> {
  const paths = await storePaths($)
  const sources: [MemorySource, string | undefined][] = [
    ['project', paths.project],
    ['global', paths.global],
  ]
  const memories: Memory[] = []
  for (const [source, path] of sources) {
    if (path === undefined || !(await $.fs.exists(path))) continue
    const store = parseStore(String(await $.fs.read(path)))
    memories.push(...store.entries.map(entry => ({ ...entry, source })))
  }
  return memories
}

const countLive = (memories: readonly Memory[]) => memories.filter(m => !isExtinct(m)).length

async function showStatus($: EngineInterface, skipped?: 'timeout' | 'error') {
  const recall = skipped === undefined
    ? `${(await read($, lastRecalled)).length} recalled`
    : `recall skipped (${skipped})`
  $.ui.status(`Nemp · ${await read($, total)} memories · ${recall}`)
}

/** Clears the last recall, so the pane and status never show a stale one. */
async function skipRecall($: EngineInterface, reason: 'timeout' | 'error') {
  await update($, lastRecalled, () => [])
  await showStatus($, reason)
}

async function debugLog($: EngineInterface, line: string) {
  // No "nemp-mod:" here: the engine leads every plugin log line with the name.
  if (await read($, isDebug)) $.ui.log(line)
}

/** Races `work` against the clock; the work's late rejection is swallowed. */
async function withTimeout<T>($: EngineInterface, work: Promise<T>, ms: number) {
  work.catch(() => undefined)
  const stop = new AbortController()
  const timer = $.clock
    .sleep(ms, { signal: stop.signal })
    .then((): typeof TIMED_OUT => TIMED_OUT, () => new Promise<never>(() => undefined))
  try {
    return await Promise.race([work, timer])
  } finally {
    stop.abort()
  }
}

async function recallFor($: EngineInterface, text: string) {
  const memories = await loadMemories($)
  const recalled = selectMemories(text, memories, {
    limit: RECALL_LIMIT,
    pinned: await read($, pinned),
    dropped: await read($, dropped),
  })
  return { recalled, total: countLive(memories) }
}

const toggle = (list: readonly string[], id: string) =>
  list.includes(id) ? list.filter(x => x !== id) : [...list, id]

async function togglePin($: EngineInterface, id: string) {
  await update($, pinned, list => toggle(list, id))
  await update($, dropped, list => list.filter(x => x !== id))
}

async function toggleDrop($: EngineInterface, id: string) {
  await update($, dropped, list => toggle(list, id))
  await update($, pinned, list => list.filter(x => x !== id))
}

/** Where save.md saves: the project store inside a git repo (or one that has a store), else global. */
async function saveTarget($: EngineInterface) {
  const paths = await storePaths($)
  const isProject =
    (await $.fs.exists(`${paths.cwd}/.git`)) || (await $.fs.exists(paths.project))
  if (isProject || paths.global === undefined) {
    return { path: paths.project, dir: paths.projectDir, projectPath: paths.cwd }
  }
  return { path: paths.global, dir: paths.global.replace(/\/memories\.json$/, ''), projectPath: null }
}

async function appendLog($: EngineInterface, path: string, lines: string[]) {
  const before = (await $.fs.exists(path)) ? String(await $.fs.read(path)) : ''
  await $.fs.write(path, before + lines.map(l => l + '\n').join(''))
}

/** Asks the conversation for its key decisions and saves them the way save.md does. */
async function capture($: EngineInterface) {
  const reply = await $.model.fork({ prompt: CAPTURE_PROMPT })
  if (!reply.isAnswered) {
    $.ui.log(`capture skipped (${reply.reason})`, { to: 'debug' })
    return
  }
  const decisions = parseCaptured(reply.text)
  if (decisions.length === 0) return

  const target = await saveTarget($)
  const text = (await $.fs.exists(target.path)) ? String(await $.fs.read(target.path)) : '{}'
  let store = parseStore(text) // a store that does not parse is never overwritten
  const now = new Date(await $.clock.now()).toISOString()
  const log: string[] = []
  const savedKeys: string[] = []
  const warnings: string[] = []
  for (const decision of decisions) {
    const before = store.entries.find(e => e.key === normalizeKey(decision.key))
    const saved = upsertEntry(store, decision, { now, projectPath: target.projectPath })
    store = saved.store
    savedKeys.push(saved.entry.key)
    log.push(`[${now.replace(/\.\d+Z$/, 'Z')}] WRITE key=${saved.entry.key} agent=main chars=${saved.entry.value.length}`)
    if (before !== undefined && before.value !== saved.entry.value) {
      warnings.push(`${saved.entry.key} replaced its earlier value "${before.value}"`)
    }
    // save.md 9b: never blocks the save, but records and names each conflict.
    for (const conflict of findConflicts(saved.entry, store.entries)) {
      store = linkConflict(store, conflict)
      warnings.push(`${conflict.key} may conflict with ${conflict.withKey} (${conflict.reason})`)
    }
  }
  await $.fs.write(target.path, serializeStore(store))
  await appendLog($, `${target.dir}/access.log`, log)

  const memories = await loadMemories($)
  await update($, total, () => countLive(memories))
  await showStatus($)
  $.ui.toast(`Nemp saved: ${savedKeys.join(', ')}`, { timeoutMs: TOAST_MS })
  if (warnings.length > 0) {
    $.ui.toast(`Nemp: ${warnings.join('; ')}. Both kept; review with /nemp:recall.`, { timeoutMs: TOAST_MS })
  }
}

function formatFound(query: string, found: readonly RecalledMemory[]) {
  if (found.length === 0) return `No Nemp memories matched "${query}".`
  return [
    `Found ${found.length} Nemp ${found.length === 1 ? 'memory' : 'memories'} for "${query}":`,
    ...found.map(r => `- [${r.key}] (${r.source}${r.type ? `, ${r.type}` : ''}, score ${r.score}): ${r.value}`),
  ].join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      const memories = await loadMemories($)
      await update($, total, () => countLive(memories))
    } catch (err) {
      $.ui.log(`could not read memories: ${String(err)}`, { to: 'debug' })
    }
    await showStatus($)

    try {
      await $.tool.register({
        name: 'nemp_recall',
        description:
          "Search the user's Nemp memory (local project and global .nemp/memories.json stores) for saved " +
          'decisions, conventions, preferences and facts. Use it mid-task when earlier project context would help.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'What to look for, in plain words or a memory key' },
            limit: { type: 'number', description: 'Most results to return (1 to 20, default 5)' },
          },
          required: ['query'],
        },
      })
    } catch (err) {
      $.ui.log(`could not register nemp_recall: ${String(err)}`)
    }

    try {
      await $.command.register({
        name: 'nemp-pane',
        description: 'Show the Nemp memories recalled for the last prompt, with Pin and Drop',
      })
      await $.command.register({
        name: 'nemp-capture',
        description: 'Turn saving key decisions to Nemp after each turn on or off (default off)',
        argumentHint: 'on|off',
      })
    } catch (err) {
      $.ui.log(`could not register commands: ${String(err)}`)
    }

    try {
      await $.command.register({
        name: 'nemp-debug',
        description: 'Turn logging each Nemp recall to the transcript on or off (default off)',
        argumentHint: 'on|off',
      })
    } catch (err) {
      $.ui.log(`could not register /nemp-debug: ${String(err)}`)
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.text.trimStart().startsWith('/')) return next(e)

    let recalled: RecalledMemory[]
    try {
      const outcome = await withTimeout($, recallFor($, e.text), RECALL_TIMEOUT_MS)
      if (outcome === TIMED_OUT) {
        $.ui.toast('Nemp: recall took over 2s, so your prompt was sent without memories')
        await skipRecall($, 'timeout')
        await debugLog($, 'recall skipped (timeout)')
        return next(e)
      }
      recalled = outcome.recalled
      await update($, total, () => outcome.total)
      await update($, lastRecalled, () => recalled)
      await showStatus($)
      const top = recalled.map(r => `${r.key}:${r.isPinned ? 'pinned' : r.score.toFixed(2)}`).join(' ')
      await debugLog($, `recall n=${recalled.length} of ${outcome.total}${top === '' ? '' : ` top=${top}`}`)
    } catch (err) {
      $.ui.toast('Nemp: recall failed, so your prompt was sent without memories')
      $.ui.log(`recall failed: ${String(err)}`, { to: 'debug' })
      await skipRecall($, 'error')
      return next(e)
    }

    if (recalled.length === 0) return next(e)
    return next({ ...e, context: [...(e.context ?? []), contextBlock(recalled)] })
  })

  on('tool.call', { tool: TOOL }, async ($, e) => {
    const query = typeof e.query === 'string' ? e.query.trim() : ''
    const asked = typeof e.limit === 'number' && Number.isFinite(e.limit) ? Math.floor(e.limit) : 5
    const limit = Math.min(20, Math.max(1, asked))
    if (query === '') return { result: 'nemp_recall needs a non-empty query.' }
    try {
      const memories = await loadMemories($)
      const found = selectMemories(query, memories, {
        limit,
        pinned: [],
        dropped: await read($, dropped),
      })
      return { result: formatFound(query, found) }
    } catch (err) {
      return { result: `Nemp memory could not be read: ${String(err)}` }
    }
  })

  on('turn.complete', async ($, e, next) => {
    const out = await next(e)
    if (e.agentId !== undefined || e.reason !== 'answer') return out
    if (!(await read($, isCapturing))) return out
    // After the turn, outside its dispatch: capture never holds the session up.
    $.clock.after(0, () => {
      capture($).catch(err => $.ui.log(`capture failed: ${String(err)}`))
    })
    return out
  })

  on('command.run', { command: 'nemp-pane' }, async $ => {
    const opened = await $.ui.open({ id: PANE, title: 'Nemp' })
    await update($, isBandShown, () => !opened.isPlaced)
    return {
      text: opened.isPlaced
        ? 'Nemp pane opened.'
        : 'The Nemp pane could not be placed here, so a compact view is shown above the prompt.',
    }
  })

  on('command.run', { command: 'nemp-capture' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'on' || arg === 'off') {
      await update($, isCapturing, () => arg === 'on')
    } else if (arg !== '') {
      return { text: 'Usage: /nemp-capture on|off' }
    }
    const isOn = await read($, isCapturing)
    return {
      text: isOn
        ? 'Nemp capture is on: key decisions from each main turn are saved to .nemp/memories.json.'
        : 'Nemp capture is off.',
    }
  })

  on('command.run', { command: 'nemp-debug' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'on' || arg === 'off') {
      await update($, isDebug, () => arg === 'on')
    } else if (arg !== '') {
      return { text: 'Usage: /nemp-debug on|off' }
    }
    return {
      text: (await read($, isDebug))
        ? 'Nemp debug is on: each recall is logged to the transcript.'
        : 'Nemp debug is off.',
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const list = await read($, lastRecalled)
    const pins = await read($, pinned)
    const drops = await read($, dropped)
    // Dropped memories no longer recall, so the last prompt's list cannot
    // bring them back: they get a section of their own.
    const shown = new Set(list.map(r => r.id))
    const droppedElsewhere = drops.filter(id => !shown.has(id))
    const droppedSection = droppedElsewhere.length === 0 ? null : (
      <Box key="dropped" flexDirection="column" marginTop={1}>
        <Text bold>Dropped this session</Text>
        {droppedElsewhere.map((id, i) => {
          const [source, ...key] = id.split(':')
          return (
            <Box key={`dropped-${i + 1}`} gap={1}>
              <Text>{key.join(':')}</Text>
              <Text dimColor>{source}</Text>
              <Button key={`restore-${i + 1}`} label="Restore" onPress={() => toggleDrop($, id)} />
            </Box>
          )
        })}
      </Box>
    )
    const title = <Text key="title" bold>Nemp</Text>

    if (list.length === 0) {
      return (
        <Box flexDirection="column">
          {title}
          <Text dimColor>No memories were injected on the last prompt.</Text>
          <Text dimColor>{`Nemp · ${await read($, total)} memories`}</Text>
          {droppedSection}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        {title}
        <Text dimColor>Injected on the last prompt. Keys 1-5 pin, 6-0 drop.</Text>
        {list.map((r, i) => {
          const isPinned = pins.includes(r.id)
          const isDropped = drops.includes(r.id)
          return (
            <Box key={`row-${i + 1}`} flexDirection="column" marginTop={1}>
              <Box gap={1}>
                <Text bold strikethrough={isDropped}>{`${i + 1}. ${r.key}`}</Text>
                <Text dimColor>{`${isPinned ? 'pinned' : r.score.toFixed(2)} · ${r.source}`}</Text>
                <Button
                  key={`pin-${i + 1}`}
                  label={isPinned ? 'Unpin' : 'Pin'}
                  {...(i < 5 ? { hotkey: String(i + 1) } : {})}
                  onPress={() => togglePin($, r.id)}
                />
                <Button
                  key={`drop-${i + 1}`}
                  label={isDropped ? 'Restore' : 'Drop'}
                  {...(i < 5 ? { hotkey: String((i + 6) % 10) } : {})}
                  onPress={() => toggleDrop($, r.id)}
                />
              </Box>
              <Text dimColor wrap="truncate-end">{r.value}</Text>
            </Box>
          )
        })}
        {droppedSection}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isBandShown))) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const list = await read($, lastRecalled)
    const pins = await read($, pinned)
    const drops = await read($, dropped)

    return (
      <Box flexDirection="column">
        <Box gap={1}>
          <Text bold>Nemp</Text>
          <Text dimColor>{`${list.length} recalled on the last prompt`}</Text>
          <Button key="close" label="Close" hotkey="c" onPress={() => update($, isBandShown, () => false)} />
        </Box>
        {list.slice(0, 5).map((r, i) => (
          <Box key={`row-${i + 1}`} gap={1}>
            <Text strikethrough={drops.includes(r.id)} wrap="truncate-end">
              {`${i + 1}. ${r.key} (${pins.includes(r.id) ? 'pinned' : r.score.toFixed(2)}, ${r.source})`}
            </Text>
            <Button
              key={`pin-${i + 1}`}
              plain
              label={pins.includes(r.id) ? 'Unpin' : 'Pin'}
              hotkey={String(i + 1)}
              onPress={() => togglePin($, r.id)}
            />
            <Button
              key={`drop-${i + 1}`}
              plain
              label={drops.includes(r.id) ? 'Restore' : 'Drop'}
              hotkey={String((i + 6) % 10)}
              onPress={() => toggleDrop($, r.id)}
            />
          </Box>
        ))}
      </Box>
    )
  })
}
