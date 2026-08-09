import { describe, expect, it } from 'vitest'
import { ALL } from './index'
import { fmt } from '../../lib/format'

/* Acceptance check 6: "Every visible `sub` line, read left to right, must
   evaluate to the displayed value."

   The spec treats this as a manual read-through. It does not have to be. The
   substitution lines are arithmetic, so they can be translated back into
   JavaScript and evaluated. If a `sub` line ever drifts from the expression
   that produced the value beside it — the exact fault that would make the app
   quietly lie to someone checking its working — this catches it.

   Lines using notation that is not a plain arithmetic expression (atan, max
   over a list) are reported as skipped rather than silently passed. */

/** Rewrite a displayed substitution line as a JavaScript expression. */
function toJs(sub: string): string | null {
  if (sub === '—') return null
  // No single-expression equivalent in this translator.
  if (/atan|max\(/.test(sub)) return null

  let s = sub

  // ½ before ×, or the two collapse into ** and silently exponentiate.
  s = s.replace(/½\s*×/g, '0.5*').replace(/½/g, '0.5*')

  s = s
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–]/g, '-') // U+2212 minus, en dash
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')

  s = s.replace(/π²/g, '(Math.PI*Math.PI)').replace(/π/g, 'Math.PI')

  // √(…) and √123
  s = s.replace(/√\(/g, 'Math.sqrt(').replace(/√([0-9.eE+-]+)/g, 'Math.sqrt($1)')

  // Implicit multiplication, as in "2π" and "π²×…" written as "2Math.PI".
  s = s.replace(/(\d)\s*(?=Math\.)/g, '$1*')
  s = s.replace(/\)\s*(?=Math\.)/g, ')*')

  // Whatever is left must be pure arithmetic before it goes near Function().
  const bare = s.replace(/Math\.(sqrt|PI)/g, '')
  if (/[^0-9eE+\-*/(). ]/.test(bare)) return null

  return s
}

type Line = { id: string; sym: string; sub: string; shown: string }

const evaluated: Line[] = []
const skipped: Line[] = []

for (const rel of ALL) {
  const args: Record<string, number> = {}
  for (const i of rel.inputs) args[i.k] = i.def
  for (const o of rel.solve(args)) {
    const line: Line = { id: rel.id, sym: o.sym, sub: o.sub, shown: fmt(o.val) }
    if (toJs(o.sub) === null) skipped.push(line)
    else evaluated.push(line)
  }
}

describe('acceptance check 6 — substitution lines evaluate to the value shown', () => {
  it.each(evaluated.map((l) => [`${l.id} ${l.sym}`, l] as const))('%s', (_label, l) => {
    const js = toJs(l.sub)!
    const value = Function(`"use strict"; return (${js})`)() as number
    const shown = Number(l.shown)

    const detail = `${l.id} ${l.sym}\n  shown as: ${l.sub}\n  evaluates: ${js}\n  gives: ${value}\n  displayed: ${shown}`

    if (!isFinite(shown)) {
      expect(isFinite(value), detail).toBe(false)
      return
    }
    if (shown === 0) {
      expect(Math.abs(value), detail).toBeLessThan(1e-9)
      return
    }

    // The line shows numbers already rounded to 4 significant figures, so it
    // can only reproduce the value to about that precision. Compare relatively.
    expect(Math.abs((value - shown) / shown), detail).toBeLessThan(2e-3)
  })

  it('covers nearly every result line', () => {
    const total = evaluated.length + skipped.length
    expect(evaluated.length).toBeGreaterThan(100)
    expect(evaluated.length / total).toBeGreaterThan(0.95)
  })

  it('skips only lines that are not plain arithmetic', () => {
    for (const s of skipped) {
      expect(
        /atan|max\(/.test(s.sub) || s.sub === '—',
        `${s.id} ${s.sym} was skipped but looks evaluable: "${s.sub}"`,
      ).toBe(true)
    }
  })
})
