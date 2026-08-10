/* Reading a testing machine's CSV export. Papa Parse does the actual parsing;
   everything here is about working out which two columns we want. */

import Papa from 'papaparse'
import type { Reading } from '../types'

/** Header names that mean "the force being applied". */
const FORCE_NAMES = ['force', 'load', 'f']
/** Header names that mean "how much the specimen has stretched". */
const ELONGATION_NAMES = ['elongation', 'extension', 'displacement', 'deltal', 'dl', 'stroke']

export type Row = Record<string, unknown>

export type ParseOutcome =
  /** Both columns were recognised; the readings are ready to analyse. */
  | { status: 'ok'; readings: Reading[]; columns: { force: string; elongation: string } }
  /** The file parsed but we could not tell which column is which. Ask. */
  | { status: 'needs-columns'; headers: string[]; rows: Row[] }
  | { status: 'error'; message: string }

/**
 * The forms of a header worth testing against the alias lists: the name with
 * case, spaces and punctuation stripped, and that same name with a trailing
 * unit removed.
 *
 * Both are needed, and neither alone is enough. Stripping the unit is what lets
 * "F_N" reach the alias "f"; keeping the unstripped form is what stops
 * "elongation" being read as "elongatio" once its final "n" is mistaken for
 * newtons.
 */
const candidates = (header: string): string[] => {
  const plain = header.toLowerCase().replace(/[^a-z0-9]/g, '')
  return [plain, plain.replace(/(kn|mm|lbf|kgf|n|m|in)$/, '')]
}

/** A single-letter alias has to match exactly, or "f" would claim every column
    beginning with an f. Longer ones may be a prefix, so "elongationat" matches. */
const matches = (header: string, aliases: string[]): boolean =>
  candidates(header).some((h) => aliases.some((a) => (a.length === 1 ? h === a : h.startsWith(a))))

const findColumn = (headers: string[], aliases: string[]): string | undefined =>
  headers.find((h) => matches(h, aliases))

/**
 * Read one cell as a number, with an empty cell coming back as NaN.
 *
 * The guard matters more than it looks: `Number(null)` and `Number('')` are
 * both 0, so without it the blank cells a machine leaves behind when a test is
 * paused would enter the analysis as a genuine reading of zero force — a
 * vertical drop to the origin in the middle of the curve.
 */
const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return NaN
  if (typeof value === 'string' && value.trim() === '') return NaN
  return Number(value)
}

/** Pull two named columns out of parsed rows. Anything unreadable becomes NaN
    and is counted and reported later, rather than being silently treated as 0. */
export const toReadings = (rows: Row[], forceColumn: string, elongationColumn: string): Reading[] =>
  rows.map((row) => ({
    force: toNumber(row[forceColumn]),
    elongation: toNumber(row[elongationColumn]),
  }))

export const parseCsv = (text: string): ParseOutcome => {
  const result = Papa.parse<Row>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const headers = (result.meta.fields ?? []).filter((h) => h !== '')
  if (headers.length < 2) {
    return {
      status: 'error',
      message: 'This file needs a header row and at least two columns: force and elongation.',
    }
  }
  if (result.data.length === 0) {
    return { status: 'error', message: 'This file has a header row but no measurements under it.' }
  }

  const force = findColumn(headers, FORCE_NAMES)
  const elongation = findColumn(headers, ELONGATION_NAMES)
  if (!force || !elongation || force === elongation) {
    return { status: 'needs-columns', headers, rows: result.data }
  }

  return {
    status: 'ok',
    readings: toReadings(result.data, force, elongation),
    columns: { force, elongation },
  }
}
