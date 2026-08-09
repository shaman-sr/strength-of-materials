import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  KEYS,
  clearAll,
  isArrayOf,
  isEphemeral,
  isStringRecord,
  load,
  remove,
  resetBackendForTests,
  save,
} from './storage'

/* Storage is exercised against stand-in backends rather than jsdom, so the
   failure modes that matter — a store that throws, and one that returns
   garbage — can be reproduced exactly. */

type Backend = {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
}

function workingStore(): Backend & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

/** Safari in private mode: reads work, writes throw. */
function readOnlyStore(): Backend {
  const data = new Map<string, string>()
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: () => {
      throw new DOMException('QuotaExceededError')
    },
    removeItem: (k) => void data.delete(k),
  }
}

function install(backend: Backend | undefined) {
  ;(globalThis as { window?: unknown }).window = backend ? { localStorage: backend } : {}
  resetBackendForTests()
}

const originalWindow = (globalThis as { window?: unknown }).window

beforeEach(() => resetBackendForTests())

afterEach(() => {
  ;(globalThis as { window?: unknown }).window = originalWindow
  resetBackendForTests()
})

describe('round trip', () => {
  it('saves and loads a value', () => {
    install(workingStore())
    save(KEYS.vals, { 'A-01.P': '25000' })
    expect(load(KEYS.vals, {}, isStringRecord)).toEqual({ 'A-01.P': '25000' })
  })

  it('returns the fallback when nothing is stored', () => {
    install(workingStore())
    expect(load(KEYS.cases, [], isArrayOf(isStringRecord))).toEqual([])
  })

  it('removes a value', () => {
    install(workingStore())
    save(KEYS.ui, { chapter: 'B' })
    remove(KEYS.ui)
    expect(load(KEYS.ui, null)).toBeNull()
  })

  it('clearAll wipes only this app’s keys', () => {
    const store = workingStore()
    install(store)
    store.data.set('someone-elses-key', 'keep me')
    save(KEYS.vals, { a: '1' })
    save(KEYS.cases, [])
    clearAll()
    expect(load(KEYS.vals, null)).toBeNull()
    expect(store.data.get('someone-elses-key')).toBe('keep me')
  })
})

describe('corrupt data', () => {
  it('falls back when the stored JSON is malformed', () => {
    const store = workingStore()
    install(store)
    store.data.set(KEYS.vals, '{not json at all')
    expect(load(KEYS.vals, { safe: 'yes' }, isStringRecord)).toEqual({ safe: 'yes' })
  })

  it('falls back when the JSON parses but is the wrong shape', () => {
    const store = workingStore()
    install(store)
    // Numbers where field text is expected: a stale schema, or a hand edit.
    store.data.set(KEYS.vals, JSON.stringify({ 'A-01.P': 25000 }))
    expect(load(KEYS.vals, { safe: 'yes' }, isStringRecord)).toEqual({ safe: 'yes' })
  })

  it('accepts a valid shape', () => {
    const store = workingStore()
    install(store)
    store.data.set(KEYS.vals, JSON.stringify({ 'A-01.P': '25000' }))
    expect(load(KEYS.vals, { safe: 'yes' }, isStringRecord)).toEqual({ 'A-01.P': '25000' })
  })

  it('drops a value that cannot be serialised rather than throwing', () => {
    install(workingStore())
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    expect(() => save(KEYS.ui, cyclic)).not.toThrow()
  })
})

describe('unavailable backend', () => {
  it('falls back to memory when writes throw, and the session still works', () => {
    install(readOnlyStore())
    expect(isEphemeral()).toBe(true)
    expect(() => save(KEYS.vals, { 'A-01.P': '1' })).not.toThrow()
    // Degraded, not broken: values still round-trip within the session.
    expect(load(KEYS.vals, {}, isStringRecord)).toEqual({ 'A-01.P': '1' })
  })

  it('falls back to memory when there is no localStorage at all', () => {
    install(undefined)
    expect(isEphemeral()).toBe(true)
    expect(() => save(KEYS.ui, { chapter: 'C' })).not.toThrow()
    expect(load<{ chapter: string } | null>(KEYS.ui, null)).toEqual({ chapter: 'C' })
  })

  it('reports a working backend as persistent', () => {
    install(workingStore())
    expect(isEphemeral()).toBe(false)
  })

  it('leaves no probe key behind', () => {
    const store = workingStore()
    install(store)
    isEphemeral()
    expect([...store.data.keys()]).toEqual([])
  })
})
