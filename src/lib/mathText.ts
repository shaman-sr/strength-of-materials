/**
 * Parenthesise a negative number that directly follows an operator, so
 * "0.3×−40" reads as "0.3×(−40)" rather than as two operators in a row.
 *
 * Display only: it adds brackets, so the expression's value is unchanged.
 */
export const clarifyNegatives = (s: string): string =>
  s.replace(/([×*/+])\s*(−\s*[\d.]+(?:e[+-]?\d+)?)/g, '$1($2)')
