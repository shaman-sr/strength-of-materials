import { useCallback, useEffect, useRef } from 'react'
import type { HistoryEntry, Output } from '../types'
import { KEYS, hasKeys, isArrayOf, load } from '../lib/storage'
import { usePersistentState } from './usePersistentState'
import { newId } from '../lib/id'

/** How long typing must stop before a calculation counts as one the user meant. */
const SETTLE_MS = 1200

/** Oldest entries fall off past this. A log you cannot scan is not a log. */
export const HISTORY_LIMIT = 100

const isEntry = (v: unknown): v is HistoryEntry =>
  hasKeys(v, ['id', 'relationId', 'inputs', 'materialId', 'at'])

const sameInputs = (a: Record<string, number>, b: Record<string, number>): boolean => {
  const ka = Object.keys(a)
  if (ka.length !== Object.keys(b).length) return false
  // Object.is so two NaN fields compare equal — otherwise a form left blank
  // would log a fresh entry on every settle.
  return ka.every((k) => Object.is(a[k], b[k]))
}

/**
 * An automatic log of calculations performed.
 *
 * Results recompute on every keystroke, so recording each one would bury the
 * log in junk — typing "25000" would file five entries. Three rules keep it
 * readable: only record once typing has settled, never record a state
 * identical to that relation's previous entry, and cap the total.
 */
export function useHistory() {
  const [history, setHistory] = usePersistentState<HistoryEntry[]>(KEYS.history, () =>
    load<HistoryEntry[]>(KEYS.history, [], isArrayOf(isEntry)),
  )

  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const t of pending.values()) clearTimeout(t)
      pending.clear()
    }
  }, [])

  const record = useCallback(
    (
      relationId: string,
      inputs: Record<string, number>,
      outputs: Output[],
      materialId: string,
    ) => {
      const existing = timers.current.get(relationId)
      if (existing) clearTimeout(existing)

      timers.current.set(
        relationId,
        setTimeout(() => {
          timers.current.delete(relationId)

          const id = newId()
          const at = Date.now()

          // Dedup inside the updater so it tests against what is actually
          // stored, not a snapshot taken when the timer was set.
          setHistory((prev) => {
            const previous = prev.find((e) => e.relationId === relationId)
            if (previous && sameInputs(previous.inputs, inputs)) return prev
            const entry: HistoryEntry = { id, relationId, inputs, outputs, materialId, at }
            return [entry, ...prev].slice(0, HISTORY_LIMIT)
          })
        }, SETTLE_MS),
      )
    },
    [setHistory],
  )

  const clearHistory = useCallback(() => setHistory([]), [setHistory])

  return { history, record, clearHistory }
}
