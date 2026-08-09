import type { Chapter, IndexedRelation, Relation } from '../../types'
import { axial } from './a-axial'
import { torsion } from './b-torsion'
import { bending } from './c-bending'
import { deflection } from './d-deflection'
import { columns } from './e-columns'
import { vessels } from './f-vessels'
import { principal } from './g-principal'
import { energy } from './h-energy'
import { springs } from './i-springs'

export const CHAPTERS: Chapter[] = [
  axial,
  torsion,
  bending,
  deflection,
  columns,
  vessels,
  principal,
  energy,
  springs,
]

/** Every relation, flattened and carrying its chapter, for search and lookup. */
export const ALL: IndexedRelation[] = CHAPTERS.flatMap((c) =>
  c.items.map((it) => ({ ...it, ch: c.key, chTitle: c.title })),
)

const BY_ID = new Map<string, IndexedRelation>(ALL.map((it) => [it.id, it]))

export const relationById = (id: string): IndexedRelation | undefined => BY_ID.get(id)

/** Search across name, governing equation, id and chapter title. */
export const searchRelations = (query: string): IndexedRelation[] => {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return ALL.filter((it) =>
    `${it.name} ${it.headline} ${it.id} ${it.chTitle}`.toLowerCase().includes(q),
  )
}

/** Default field text for every input of every relation, keyed `${id}.${k}`. */
export const defaultVals = (): Record<string, string> => {
  const v: Record<string, string> = {}
  for (const it of ALL) {
    for (const i of it.inputs) v[`${it.id}.${i.k}`] = String(i.def)
  }
  return v
}

export type { Relation }
