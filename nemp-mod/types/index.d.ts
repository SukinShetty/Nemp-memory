export type MemorySource = 'project' | 'global'

/** One memory as recall chose it: what the pane lists and the model reads. */
export type RecalledMemory = {
  /** `<source>:<key>`, the id pins and drops are kept under. */
  id: string
  key: string
  value: string
  type: string | undefined
  source: MemorySource
  /** Relevance to the prompt, 0..1. */
  score: number
  isPinned: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'nemp-mod': {
      /** The memories injected on the last prompt. */
      lastRecalled: RecalledMemory[]
      /** Memory ids always injected this session. */
      pinned: string[]
      /** Memory ids never injected this session. */
      dropped: string[]
      /** Memories in the project and global stores, extinct ones left out. */
      total: number
      /** /nemp-capture on|off; off by default. */
      isCapturing: boolean
      /** The compact band above the prompt, used when the pane cannot be placed. */
      isBandShown: boolean
      /** /nemp-debug on|off; off by default. Logs each recall to the transcript. */
      isDebug: boolean
    }
  }
}
