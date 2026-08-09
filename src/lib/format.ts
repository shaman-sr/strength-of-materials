/* Number presentation. `fmt` is load-bearing: it renders every value in the
   readout AND every number inside a substitution line, so the two always
   agree. Ported from the reference implementation unchanged. */

/**
 * Format a number for display. Non-finite and non-numeric input renders as an
 * em dash, which is how a blank or nonsensical field stays readable instead of
 * printing NaN or Infinity.
 */
export const fmt = (x: unknown, p = 4): string => {
  if (x === null || x === undefined || typeof x !== 'number' || !isFinite(x)) return '—'
  const a = Math.abs(x)
  if (a !== 0 && (a < 1e-3 || a >= 1e6)) return x.toExponential(3)
  return String(parseFloat(x.toPrecision(p)))
}

/**
 * Parse a field's raw text into a number for solving.
 *
 * Blank, whitespace and partial entries like "-" or "1e" become NaN rather
 * than 0. That distinction matters: 0 is a real load the user might mean,
 * while NaN flows through the solve and renders as "—".
 */
export const parseField = (raw: string | number | undefined): number => {
  if (typeof raw === 'number') return raw
  if (raw === undefined) return NaN
  const s = raw.trim()
  if (s === '') return NaN
  return Number(s)
}

/** Timestamp for the revision and log tables: "09 AUG 26 14:32". */
export const stamp = (ms: number): string => {
  const d = new Date(ms)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}  ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
