/* The only module that touches localStorage.
   Everything is namespaced and versioned, and every call is guarded: Safari in
   private mode throws on write, and a user can always hand us corrupt JSON.
   Neither may blank the page, so both fall back to an in-memory map and the
   session carries on working — it just will not survive a reload.

   Swapping this file for AsyncStorage or Firebase later is the whole migration;
   nothing above it knows where the bytes go. */

const NS = 'som:v1'
export const SCHEMA_VERSION = 1

export const KEYS = {
  vals: `${NS}:vals`,
  ui: `${NS}:ui`,
  cases: `${NS}:cases`,
  history: `${NS}:history`,
  meta: `${NS}:meta`,
} as const

/** Used whenever the real store is unavailable, so reads and writes still pair
 *  up within a session. */
const memory = new Map<string, string>()

let backendChecked = false
let usingMemory = false

/** True when persistence has silently degraded to memory only. */
export const isEphemeral = (): boolean => {
  probe()
  return usingMemory
}

function probe(): void {
  if (backendChecked) return
  backendChecked = true
  try {
    const probeKey = `${NS}:probe`
    window.localStorage.setItem(probeKey, '1')
    window.localStorage.removeItem(probeKey)
    usingMemory = false
  } catch {
    usingMemory = true
  }
}

function readRaw(key: string): string | null {
  probe()
  if (usingMemory) return memory.get(key) ?? null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

function writeRaw(key: string, value: string): void {
  probe()
  if (usingMemory) {
    memory.set(key, value)
    return
  }
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Quota exceeded, or the store vanished mid-session. Keep the value for
    // this session rather than losing the user's work outright.
    usingMemory = true
    memory.set(key, value)
  }
}

/**
 * Read and parse a stored value.
 *
 * Anything unreadable — absent, malformed, or the wrong shape — yields the
 * fallback. `validate` is what stops a hand-edited or stale record from
 * reaching the app as a half-valid object.
 */
export function load<T>(key: string, fallback: T, validate?: (v: unknown) => v is T): T {
  const raw = readRaw(key)
  if (raw === null) return fallback
  try {
    const parsed: unknown = JSON.parse(raw)
    if (validate) return validate(parsed) ? parsed : fallback
    return parsed as T
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): void {
  try {
    writeRaw(key, JSON.stringify(value))
  } catch {
    // A value that cannot be serialised (a cycle, a BigInt) is a programming
    // error, not a user-facing one. Dropping the write is better than throwing
    // out of a state setter.
  }
}

export function remove(key: string): void {
  probe()
  memory.delete(key)
  if (usingMemory) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* nothing to do */
  }
}

/** Record the schema version so a future migration has something to branch on. */
export function stampSchema(): void {
  save(KEYS.meta, { schemaVersion: SCHEMA_VERSION })
}

/** Wipe everything this app stored, leaving other keys on the origin alone. */
export function clearAll(): void {
  for (const key of Object.values(KEYS)) remove(key)
}

/** Test seam: forget the probe result so a fresh backend can be detected. */
export function resetBackendForTests(): void {
  backendChecked = false
  usingMemory = false
  memory.clear()
}

/* ---- shape guards ---------------------------------------------------- */

export const isStringRecord = (v: unknown): v is Record<string, string> =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  Object.values(v).every((x) => typeof x === 'string')

export const isArrayOf =
  <T>(item: (v: unknown) => v is T) =>
  (v: unknown): v is T[] =>
    Array.isArray(v) && v.every(item)

export const hasKeys = (v: unknown, keys: string[]): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && keys.every((k) => k in v)
