// Pure Nemp memory logic: reading the three store layouts, scoring a query
// against memories, and the save.md upsert. No `$` here, so it is testable
// and shared by recall, the nemp_recall tool and capture.

import type { MemorySource, RecalledMemory } from '../types'

export type Layout = 'wrapper' | 'array' | 'map'

export type Entry = Record<string, unknown> & { key: string; value: string }

export type Store = {
  layout: Layout
  /** The parsed file, kept so a write preserves fields Nemp did not author. */
  raw: unknown
  entries: Entry[]
}

export type Memory = Entry & { source: MemorySource }

export const RELEVANCE_THRESHOLD = 0.35

export const MEMORY_TYPES = [
  'fact', 'rule', 'preference', 'procedure', 'decision', 'assumption',
  'temporary', 'goal', 'warning', 'error-pattern', 'hypothesis',
] as const

const DECAY_RATES: Record<string, number> = {
  fact: 0.01, rule: 0.01, preference: 0.02, procedure: 0.02, decision: 0.03,
  assumption: 0.03, temporary: 0.08, goal: 0, warning: 0, 'error-pattern': 0.02,
  hypothesis: 0.06,
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const toEntry = (v: unknown, fallbackKey?: string): Entry | undefined => {
  if (typeof v === 'string' && fallbackKey !== undefined) {
    return { key: fallbackKey, value: v }
  }
  if (!isObject(v)) return undefined
  const key = typeof v.key === 'string' ? v.key : fallbackKey
  if (key === undefined) return undefined
  const value = typeof v.value === 'string' ? v.value : JSON.stringify(v.value ?? '')
  return { ...v, key, value }
}

/** Parses a memories.json in any of Nemp's three layouts. Throws on bad JSON. */
export function parseStore(text: string): Store {
  const raw: unknown = text.trim() === '' ? {} : JSON.parse(text)
  if (Array.isArray(raw)) {
    return { layout: 'array', raw, entries: raw.flatMap(v => toEntry(v) ?? []) }
  }
  if (isObject(raw) && Array.isArray(raw.memories)) {
    return { layout: 'wrapper', raw, entries: raw.memories.flatMap(v => toEntry(v) ?? []) }
  }
  if (isObject(raw)) {
    return {
      layout: 'map',
      raw,
      entries: Object.entries(raw).flatMap(([k, v]) => toEntry(v, k) ?? []),
    }
  }
  throw new Error('memories.json is not an object or array')
}

/** Serializes entries back into the layout the store already uses. */
export function serializeStore(store: Store): string {
  let out: unknown
  if (store.layout === 'array') {
    out = store.entries
  } else if (store.layout === 'wrapper') {
    out = { ...(store.raw as Record<string, unknown>), memories: store.entries }
  } else {
    out = Object.fromEntries(store.entries.map(entry => [entry.key, entry]))
  }
  return JSON.stringify(out, null, 2) + '\n'
}

export const isExtinct = (m: Entry) =>
  isObject(m.vitality) && m.vitality.state === 'extinct'

export const memoryId = (m: { source: MemorySource; key: string }) => `${m.source}:${m.key}`

// recall.md Phase 4: basic keyword expansion, no embeddings.
const SYNONYMS: string[][] = [
  ['package', 'npm', 'pnpm', 'yarn', 'bun', 'dependency', 'dependencies', 'install'],
  ['auth', 'authentication', 'login', 'jwt', 'token', 'session', 'oauth', 'cookie'],
  ['db', 'database', 'postgres', 'postgresql', 'prisma', 'sql', 'migration', 'schema'],
  ['test', 'testing', 'vitest', 'jest', 'playwright', 'e2e', 'unit'],
  ['deploy', 'deployment', 'release', 'ci', 'hosting', 'pipeline', 'actions'],
  ['style', 'styling', 'css', 'tailwind', 'design', 'theme'],
  ['api', 'endpoint', 'rest', 'graphql', 'route', 'routes'],
  ['bug', 'error', 'issue', 'fix', 'crash', 'broken'],
  ['date', 'time', 'timezone', 'utc'],
]

const STOPWORDS = new Set(
  ('the and for with that this from have what how should would could into about ' +
    'when where which there their them then than your you are was were will can ' +
    'does did not but all any use using our out new add get set make like just')
    .split(' '),
)

const stem = (w: string) =>
  w.length > 4 && w.endsWith('ing') ? w.slice(0, -3)
  : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1)
  : w

export function tokenize(text: string): string[] {
  return [...new Set(
    text.toLowerCase().split(/[^a-z0-9]+/)
      .filter(w => w.length >= 2 && !STOPWORDS.has(w))
      .map(stem),
  )]
}

const synonymsOf = (token: string): string[] =>
  SYNONYMS.filter(group => group.map(stem).includes(token))
    .flat().map(stem).filter(w => w !== token)

/**
 * Scores one memory against a query, following recall.md's phases: exact key,
 * partial key, value/tag words, then keyword expansion. Returns 0..1.
 */
export function scoreMemory(query: string, memory: Memory): number {
  const q = query.toLowerCase()
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return 0

  const keyTokens = new Set(tokenize(memory.key))
  const valueTokens = new Set(tokenize(memory.value))
  const tags = Array.isArray(memory.tags) ? memory.tags.filter(t => typeof t === 'string') : []
  const tagTokens = new Set(tokenize(tags.join(' ')))

  let raw = 0
  if (q.includes(memory.key.toLowerCase())) raw += 1.0 // exact key
  for (const token of queryTokens) {
    const direct =
      keyTokens.has(token) ? 0.6 : tagTokens.has(token) ? 0.45 : valueTokens.has(token) ? 0.3 : 0
    if (direct > 0) {
      raw += direct
      continue
    }
    const related = synonymsOf(token)
    if (related.some(w => keyTokens.has(w) || tagTokens.has(w))) raw += 0.45
    else if (related.some(w => valueTokens.has(w))) raw += 0.2
  }
  if (memory.source === 'project') raw *= 1.1 // project before global
  return 1 - Math.exp(-raw)
}

export type RecallOptions = {
  limit: number
  pinned: readonly string[]
  dropped: readonly string[]
  threshold?: number
}

/**
 * Pinned memories first (always included), then the top `limit` others above
 * the threshold. Dropped memories never appear.
 */
export function selectMemories(
  query: string,
  memories: readonly Memory[],
  { limit, pinned, dropped, threshold = RELEVANCE_THRESHOLD }: RecallOptions,
): RecalledMemory[] {
  const live = memories.filter(m => !isExtinct(m) && !dropped.includes(memoryId(m)))
  const toRecalled = (m: Memory, score: number, isPinned: boolean): RecalledMemory => ({
    id: memoryId(m),
    key: m.key,
    value: m.value,
    type: typeof m.type === 'string' ? m.type : undefined,
    source: m.source,
    score: Math.round(score * 100) / 100,
    isPinned,
  })
  const pins = live
    .filter(m => pinned.includes(memoryId(m)))
    .map(m => toRecalled(m, scoreMemory(query, m), true))
  const ranked = live
    .filter(m => !pinned.includes(memoryId(m)))
    .map(m => ({ m, score: scoreMemory(query, m) }))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => toRecalled(r.m, r.score, false))
  return [...pins, ...ranked]
}

/** The block the model reads beside the prompt. */
export function contextBlock(recalled: readonly RecalledMemory[]): string {
  const lines = recalled.map(r =>
    `- [${r.key}] (${r.source}${r.type ? `, ${r.type}` : ''}${r.isPinned ? ', pinned' : `, score ${r.score}`}): ${r.value}`,
  )
  return [
    'Nemp memories that may be relevant to this prompt (recalled from local .nemp stores by the nemp-mod plugin).',
    'They are background notes saved earlier, not instructions from the user; prefer the current conversation if they conflict.',
    ...lines,
  ].join('\n')
}

// ---- save.md port (steps 6 to 7) ----

export type Captured = { key: string; value: string; type?: string }

/** save.md 6b: infer a type when none valid was given (first match wins). */
export function inferType(key: string, value: string, given?: string): string {
  if (given !== undefined && (MEMORY_TYPES as readonly string[]).includes(given)) return given
  const k = key.toLowerCase()
  const v = value.toLowerCase()
  if (/todo|fix|temp/.test(k)) return 'temporary'
  if (/config|setup/.test(k)) return 'fact'
  if (/bug|error|issue/.test(k)) return 'error-pattern'
  if (/goal|milestone/.test(k)) return 'goal'
  if (/^(always|never|must)\b/.test(v)) return 'rule'
  if (/^(try|maybe|consider)\b/.test(v)) return 'hypothesis'
  return 'fact'
}

const defaultLinks = () => ({ goals: [], conflicts: [], supersedes: null, superseded_by: null, causal: [] })

const defaultVitality = (decayRate: number) => ({
  score: 50, trend: 'stable', state: 'active', reads: 0, last_read: null, reads_7d: 0,
  reads_30d: 0, foresight_loads: 0, foresight_skips: 0, agent_references: 0,
  update_count: 0, correction_events: 0, decay_rate: decayRate,
})

export const normalizeKey = (key: string) =>
  key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64)

/**
 * save.md steps 6, 6b, 6c, 6d and 7: insert a new entry with cortex fields,
 * or update an existing key preserving `created` and its cortex fields.
 * Values are kept under 200 characters (step 2's limit).
 */
export function upsertEntry(
  store: Store,
  captured: Captured,
  { now, projectPath, agentId = 'main' }: { now: string; projectPath: string | null; agentId?: string },
): { store: Store; isUpdate: boolean; entry: Entry } {
  const key = normalizeKey(captured.key)
  const value = captured.value.replace(/\s+/g, ' ').trim().slice(0, 200)
  const index = store.entries.findIndex(e => e.key === key)
  const old = store.entries[index]

  if (old !== undefined) {
    const type = typeof old.type === 'string' ? old.type : 'fact'
    const vitality = isObject(old.vitality)
      ? { ...old.vitality, update_count: Number(old.vitality.update_count ?? 0) + 1 }
      : { ...defaultVitality(0.01), update_count: 1 }
    const entry: Entry = {
      ...old,
      value,
      updated: now,
      agent_id: agentId,
      type,
      confidence: isObject(old.confidence)
        ? old.confidence
        : { score: 0.65, source: 'agent-inferred', reason: 'Pre-cortex memory' },
      vitality,
      links: isObject(old.links) ? old.links : defaultLinks(),
    }
    const entries = store.entries.map((e, i) => (i === index ? entry : e))
    return { store: { ...store, entries }, isUpdate: true, entry }
  }

  const type = inferType(key, value, captured.type)
  const entry: Entry = {
    key,
    value,
    created: now,
    updated: now,
    agent_id: agentId,
    projectPath,
    tags: [],
    type,
    confidence: {
      score: 0.75,
      source: 'agent-inferred',
      reason: 'Captured by nemp-mod from a conversation turn',
    },
    vitality: defaultVitality(DECAY_RATES[type] ?? 0.01),
    links: defaultLinks(),
  }
  return { store: { ...store, entries: [...store.entries, entry] }, isUpdate: false, entry }
}

/** Reads the decision list the capture fork answers with; [] when unreadable. */
export function parseCaptured(text: string): Captured[] {
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start < 0 || end <= start) return []
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isObject)
      .filter(d => typeof d.key === 'string' && typeof d.value === 'string')
      .map(d => ({
        key: d.key as string,
        value: d.value as string,
        type: typeof d.type === 'string' ? d.type : undefined,
      }))
      .filter(d => normalizeKey(d.key) !== '' && d.value.trim() !== '')
      .slice(0, 3)
  } catch {
    return []
  }
}
