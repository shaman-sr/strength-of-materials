import type { Input, Material, Output, Relation, Vals } from '../types'
import { CUSTOM_ID, materialValue } from '../data/materials'
import { parseField } from './format'

/* The single place that decides what number a field actually holds.
   Every consumer — the readout, saved cases, the history log — goes through
   here, so none of them can disagree about what the user's input was. */

/**
 * Is this field currently driven by the selected material rather than typed?
 *
 * Resolution order:
 *   1. no `mat` tag        → typed
 *   2. material is Custom  → typed
 *   3. field is unlocked   → typed (per-field override)
 *   4. otherwise           → the material supplies it
 */
export const isLocked = (
  relationId: string,
  input: Input,
  material: Material | undefined,
  unlocked: ReadonlySet<string>,
): boolean => {
  if (!input.mat) return false
  if (!material || material.id === CUSTOM_ID) return false
  if (unlocked.has(fieldKey(relationId, input.k))) return false
  return true
}

/** The store key for one field of one relation. */
export const fieldKey = (relationId: string, inputKey: string): string =>
  `${relationId}.${inputKey}`

/** The effective value of a single field, as text for display in the input. */
export const resolveFieldText = (
  relationId: string,
  input: Input,
  vals: Vals,
  material: Material | undefined,
  unlocked: ReadonlySet<string>,
): string => {
  if (isLocked(relationId, input, material, unlocked) && material && input.mat) {
    return String(materialValue(material, input.mat))
  }
  return vals[fieldKey(relationId, input.k)] ?? ''
}

/** The full argument object for a relation's `solve`. */
export const resolveInputs = (
  relation: Relation,
  vals: Vals,
  material: Material | undefined,
  unlocked: ReadonlySet<string>,
): Record<string, number> => {
  const args: Record<string, number> = {}
  for (const input of relation.inputs) {
    args[input.k] = parseField(
      resolveFieldText(relation.id, input, vals, material, unlocked),
    )
  }
  return args
}

/**
 * Solve a relation, never throwing.
 *
 * A relation whose maths blows up returns an empty readout rather than taking
 * the whole page down with it — one bad entry should cost you one card.
 */
export const solveRelation = (
  relation: Relation,
  args: Record<string, number>,
): Output[] => {
  try {
    return relation.solve(args)
  } catch {
    return []
  }
}

/** True when a field has been detached from the material by the EDIT control. */
export const isOverridden = (
  relationId: string,
  input: Input,
  material: Material | undefined,
  unlocked: ReadonlySet<string>,
): boolean => {
  if (!input.mat) return false
  if (!material || material.id === CUSTOM_ID) return false
  return unlocked.has(fieldKey(relationId, input.k))
}
