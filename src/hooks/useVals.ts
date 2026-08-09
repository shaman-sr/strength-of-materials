import { useCallback } from 'react'
import type { Relation, Vals } from '../types'
import { defaultVals } from '../data/chapters'
import { KEYS, isStringRecord, load } from '../lib/storage'
import { fieldKey } from '../lib/resolve'
import { usePersistentState } from './usePersistentState'

/**
 * Every input field's raw text, keyed `${relationId}.${inputKey}`.
 *
 * Text, not numbers. Parsing on the way in would collapse a half-typed "1e" or
 * a lone "-" to NaN and rewrite the field under the user's cursor, and would
 * turn a deliberately cleared field into 0 — a real load they never entered.
 * Parsing happens once, at solve time.
 */
export function useVals() {
  const [vals, setVals] = usePersistentState<Vals>(KEYS.vals, () => {
    const defaults = defaultVals()
    const stored = load<Vals>(KEYS.vals, {}, isStringRecord)
    // Merge over defaults rather than replacing them, so relations added after
    // a user's last visit arrive with their own defaults instead of blank.
    return { ...defaults, ...stored }
  })

  const setField = useCallback(
    (relationId: string, inputKey: string, text: string) => {
      setVals((prev) => ({ ...prev, [fieldKey(relationId, inputKey)]: text }))
    },
    [setVals],
  )

  /** Write a whole solved input set back — used when restoring a saved case. */
  const applyInputs = useCallback(
    (relationId: string, inputs: Record<string, number>) => {
      setVals((prev) => {
        const next = { ...prev }
        for (const [k, v] of Object.entries(inputs)) {
          next[fieldKey(relationId, k)] = String(v)
        }
        return next
      })
    },
    [setVals],
  )

  const resetRelation = useCallback(
    (relation: Relation) => {
      setVals((prev) => {
        const next = { ...prev }
        for (const i of relation.inputs) next[fieldKey(relation.id, i.k)] = String(i.def)
        return next
      })
    },
    [setVals],
  )

  return { vals, setField, applyInputs, resetRelation }
}
