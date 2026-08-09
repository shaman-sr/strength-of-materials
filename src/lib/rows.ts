import type { HistoryEntry, SavedCase } from '../types'
import { fmt } from './format'

/** One line of the revision table, whatever it was built from. */
export type Row = {
  id: string
  relationId: string
  label: string
  summary: string
  at: number
}

const summarise = (inputs: Record<string, number>): string =>
  Object.entries(inputs)
    .map(([k, v]) => `${k} ${fmt(v)}`)
    .join('   ')

export const caseRow = (c: SavedCase): Row => ({
  id: c.id,
  relationId: c.relationId,
  label: c.name,
  summary: summarise(c.inputs),
  at: c.createdAt,
})

export const historyRow = (e: HistoryEntry): Row => ({
  id: e.id,
  relationId: e.relationId,
  label: e.relationId,
  summary: summarise(e.inputs),
  at: e.at,
})
