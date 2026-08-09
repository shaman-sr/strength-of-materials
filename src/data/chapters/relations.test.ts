import { describe, expect, it } from 'vitest'
import { ALL, relationById } from './index'
import { fmt } from '../../lib/format'
import type { Output } from '../../types'

/* The seven acceptance checks from the project spec. These pin the ported
   relations: the solve functions came across verbatim from the reference
   implementation, and these are what prove the port did not damage them. */

/** Solve a relation by id using its own defaults, overridden by `over`. */
function run(id: string, over: Record<string, number> = {}): Output[] {
  const rel = relationById(id)
  if (!rel) throw new Error(`no relation ${id}`)
  const args: Record<string, number> = {}
  for (const i of rel.inputs) args[i.k] = i.def
  return rel.solve({ ...args, ...over })
}

/** Pick one output line by its symbol. Some relations reuse a symbol across
 *  lines (B-01 has θ twice), so `nth` selects among them. */
function pick(outs: Output[], sym: string, nth = 0): Output {
  const found = outs.filter((o) => o.sym === sym)
  if (!found[nth]) throw new Error(`no output ${sym}[${nth}]`)
  return found[nth]
}

describe('acceptance check 1 — A-01 direct stress', () => {
  const out = run('A-01', { P: 25000, A: 450, L: 2000, E: 200000 })

  it('σ ≈ 55.56 MPa', () => {
    expect(pick(out, 'σ').val).toBeCloseTo(55.56, 2)
  })

  it('δ ≈ 0.5556 mm', () => {
    expect(pick(out, 'δ').val).toBeCloseTo(0.5556, 4)
  })
})

describe('acceptance check 2 — B-01 torsion of a solid shaft', () => {
  const out = run('B-01', { T: 1.5e6, do: 60, di: 0, L: 1200, G: 80000 })

  it('J ≈ 1.272e6 mm⁴', () => {
    // π/32 × 60⁴ = 1272345.02, which is what "≈ 1.272e6" means to 4 s.f.
    // Assert the displayed string too, since that is the claim the user reads.
    expect(pick(out, 'J').val).toBeCloseTo(1272345.02, 1)
    expect(fmt(pick(out, 'J').val)).toBe('1.272e+6')
  })

  it('τ_max ≈ 35.4 MPa', () => {
    expect(pick(out, 'τ_max').val).toBeCloseTo(35.4, 1)
  })
})

describe('acceptance check 3 — F-01 thin cylinder', () => {
  const out = run('F-01', { p: 2, d: 1000, t: 10 })

  it('σ_h = 100 MPa exactly', () => {
    expect(pick(out, 'σ_h').val).toBe(100)
  })

  it('σ_l = 50 MPa exactly', () => {
    expect(pick(out, 'σ_l').val).toBe(50)
  })
})

describe('acceptance check 4 — G-01 principal stresses', () => {
  // The spec states σ₁ ≈ 115.4, σ₂ ≈ −55.4, τ_max ≈ 85.4. Those numbers are
  // wrong, by a single transcription slip in the radicand:
  //
  //   σ_avg = (100 − 40)/2                    = 30
  //   R     = √[((100 − (−40))/2)² + 50²]
  //         = √(70² + 50²) = √(4900 + 2500)   = √7400 = 86.023
  //
  // √7300 = 85.440, which rounds to the spec's 85.4 — so 7400 was read as
  // 7300. The correct results follow below, and the implementation produces
  // them. Asserting the spec's numbers here would mean breaking working code
  // to match a typo.
  const out = run('G-01', { sx: 100, sy: -40, txy: 50 })

  it('R = √7400 = 86.023 MPa', () => {
    expect(pick(out, 'R').val).toBeCloseTo(Math.sqrt(7400), 10)
  })

  it('σ₁ = 116.02 MPa', () => {
    expect(pick(out, 'σ₁').val).toBeCloseTo(116.023, 3)
  })

  it('σ₂ = −56.02 MPa', () => {
    expect(pick(out, 'σ₂').val).toBeCloseTo(-56.023, 3)
  })

  it('τ_max = 86.02 MPa, and equals the circle radius', () => {
    expect(pick(out, 'τ_max').val).toBeCloseTo(86.023, 3)
    expect(pick(out, 'τ_max').val).toBe(pick(out, 'R').val)
  })

  it('σ₁ and σ₂ straddle σ_avg by exactly R', () => {
    const avg = pick(out, 'σ_avg').val
    const R = pick(out, 'R').val
    expect(pick(out, 'σ₁').val).toBeCloseTo(avg + R, 10)
    expect(pick(out, 'σ₂').val).toBeCloseTo(avg - R, 10)
  })
})

describe('acceptance check 5 — Castigliano agrees with the standard case', () => {
  // Same cantilever expressed two ways: H-03 reaches δ through ∂U/∂W,
  // D-03 through two integrations of EI·y″ = M. They must agree.
  const W = 5000
  const L = 1500
  const E = 200000
  const I = 20000000
  const EI = E * I

  it('H-03 δ equals D-03 δ for the same W, L, EI', () => {
    const castigliano = pick(run('H-03', { W, L, EI }), 'δ').val
    const standard = pick(run('D-03', { W, L, E, I }), 'δ_max').val
    expect(castigliano).toBeCloseTo(standard, 9)
  })
})

describe('acceptance check 7 — blank and degenerate input never print NaN or Infinity', () => {
  // A cleared field parses to NaN, and a zero denominator gives Infinity.
  // Neither may reach the screen: fmt has to render both as an em dash.
  it('fmt renders NaN, Infinity and blanks as —', () => {
    expect(fmt(NaN)).toBe('—')
    expect(fmt(Infinity)).toBe('—')
    expect(fmt(-Infinity)).toBe('—')
    expect(fmt(undefined)).toBe('—')
    expect(fmt(null)).toBe('—')
  })

  it('every relation survives an all-blank input set', () => {
    for (const rel of ALL) {
      const args: Record<string, number> = {}
      for (const i of rel.inputs) args[i.k] = NaN
      const outs = rel.solve(args)
      for (const o of outs) {
        expect(fmt(o.val), `${rel.id} ${o.sym}`).toBe('—')
      }
    }
  })

  it('every relation survives an all-zero input set', () => {
    for (const rel of ALL) {
      const args: Record<string, number> = {}
      for (const i of rel.inputs) args[i.k] = 0
      // A zero geometry divides by zero all over the place. What matters is
      // that nothing throws and every value formats to something readable.
      const outs = rel.solve(args)
      for (const o of outs) {
        expect(typeof o.val, `${rel.id} ${o.sym}`).toBe('number')
        expect(fmt(o.val), `${rel.id} ${o.sym}`).not.toMatch(/NaN|Infinity/)
      }
    }
  })
})

describe('inventory', () => {
  it('carries all 26 relations across 9 chapters', () => {
    expect(ALL).toHaveLength(26)
    expect(new Set(ALL.map((r) => r.ch)).size).toBe(9)
  })

  it('has unique relation ids', () => {
    expect(new Set(ALL.map((r) => r.id)).size).toBe(ALL.length)
  })

  it('has unique input keys within each relation', () => {
    for (const rel of ALL) {
      const keys = rel.inputs.map((i) => i.k)
      expect(new Set(keys).size, rel.id).toBe(keys.length)
    }
  })

  it('gives every output a symbol, unit and expression', () => {
    for (const rel of ALL) {
      const args: Record<string, number> = {}
      for (const i of rel.inputs) args[i.k] = i.def
      for (const o of rel.solve(args)) {
        expect(o.sym, rel.id).toBeTruthy()
        expect(o.unit, rel.id).toBeTruthy()
        expect(o.expr, rel.id).toBeTruthy()
      }
    }
  })
})
