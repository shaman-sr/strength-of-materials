/**
 * Format a number for display.
 *
 * Non-finite and non-numeric input renders as an em dash, which is how a
 * property the app could not determine stays readable instead of printing NaN.
 */
export const fmt = (x: unknown, p = 4): string => {
  if (x === null || x === undefined || typeof x !== 'number' || !isFinite(x)) return '—'
  const a = Math.abs(x)
  if (a !== 0 && (a < 1e-3 || a >= 1e6)) return x.toExponential(3)
  return String(parseFloat(x.toPrecision(p)))
}
