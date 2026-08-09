import { useCallback } from 'react'
import type { Output, SavedCase } from '../types'
import { KEYS, hasKeys, isArrayOf, load } from '../lib/storage'
import { usePersistentState } from './usePersistentState'
import { newId } from '../lib/id'

const isCase = (v: unknown): v is SavedCase =>
  hasKeys(v, ['id', 'relationId', 'name', 'inputs', 'outputs', 'createdAt'])

/**
 * Cases the user chose to keep — an explicit act, unlike the history log.
 *
 * The outputs are stored alongside the inputs so the list can show what a case
 * produced without re-solving. They are a record of that moment only: restoring
 * a case writes its inputs back and lets the live calculator recompute, so a
 * corrected formula can never be masked by a stale stored result.
 */
export function useSavedCases() {
  const [cases, setCases] = usePersistentState<SavedCase[]>(KEYS.cases, () =>
    load<SavedCase[]>(KEYS.cases, [], isArrayOf(isCase)),
  )

  const saveCase = useCallback(
    (
      relationId: string,
      name: string,
      inputs: Record<string, number>,
      outputs: Output[],
      materialId: string,
    ) => {
      const entry: SavedCase = {
        id: newId(),
        relationId,
        name: name.trim() || relationId,
        inputs,
        outputs,
        materialId,
        createdAt: Date.now(),
      }
      setCases((prev) => [entry, ...prev])
      return entry
    },
    [setCases],
  )

  /** Overwrite a saved calculation with the current values and name, keeping
   *  its place in the list and its original creation time. */
  const updateCase = useCallback(
    (
      id: string,
      name: string,
      inputs: Record<string, number>,
      outputs: Output[],
      materialId: string,
    ) =>
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, name: name.trim() || c.name, inputs, outputs, materialId }
            : c,
        ),
      ),
    [setCases],
  )

  const deleteCase = useCallback(
    (id: string) => setCases((prev) => prev.filter((c) => c.id !== id)),
    [setCases],
  )

  const clearCases = useCallback(() => setCases([]), [setCases])

  return { cases, saveCase, updateCase, deleteCase, clearCases }
}
