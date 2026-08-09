import { describe, expect, it } from 'vitest'
import type { Input, Material, Relation, Vals } from '../types'
import { fieldKey, isLocked, isOverridden, resolveInputs, solveRelation } from './resolve'
import { CUSTOM_ID, rigidityModulus } from '../data/materials'

const steel: Material = {
  id: 'test-steel',
  name: 'Test steel',
  E: 200000,
  nu: 0.3,
  alpha: 0.000012,
  Sy: 250,
  sigma_c: 320,
}

const inputs: Input[] = [
  { k: 'P', label: 'Load', unit: 'N', def: 1000 },
  { k: 'E', label: 'Young’s modulus', unit: 'MPa', def: 70000, mat: 'E' },
  { k: 'G', label: 'Rigidity modulus', unit: 'MPa', def: 26000, mat: 'G' },
]

const rel: Relation = {
  id: 'T-01',
  name: 'Test',
  headline: '',
  why: '',
  steps: [],
  inputs,
  solve: (v) => [{ sym: 'x', unit: '—', expr: 'P/E', sub: '', val: v.P / v.E }],
}

const vals: Vals = {
  'T-01.P': '1000',
  'T-01.E': '70000',
  'T-01.G': '26000',
}

const none = new Set<string>()

describe('resolution order', () => {
  it('1. an untagged field is always typed, whatever the material', () => {
    const untagged = inputs[0]
    expect(isLocked('T-01', untagged, steel, none)).toBe(false)
    expect(resolveInputs(rel, vals, steel, none).P).toBe(1000)
  })

  it('2. Custom leaves every field typed', () => {
    const custom: Material = { ...steel, id: CUSTOM_ID }
    expect(isLocked('T-01', inputs[1], custom, none)).toBe(false)
    expect(resolveInputs(rel, vals, custom, none).E).toBe(70000)
  })

  it('2b. no material at all leaves every field typed', () => {
    expect(isLocked('T-01', inputs[1], undefined, none)).toBe(false)
    expect(resolveInputs(rel, vals, undefined, none).E).toBe(70000)
  })

  it('3. an unlocked field falls back to the typed value', () => {
    const unlocked = new Set([fieldKey('T-01', 'E')])
    expect(isLocked('T-01', inputs[1], steel, unlocked)).toBe(false)
    expect(isOverridden('T-01', inputs[1], steel, unlocked)).toBe(true)
    expect(resolveInputs(rel, vals, steel, unlocked).E).toBe(70000)
  })

  it('4. otherwise the material supplies the value', () => {
    expect(isLocked('T-01', inputs[1], steel, none)).toBe(true)
    expect(resolveInputs(rel, vals, steel, none).E).toBe(200000)
  })

  it('unlocking one field does not unlock its neighbours', () => {
    const unlocked = new Set([fieldKey('T-01', 'E')])
    const resolved = resolveInputs(rel, vals, steel, unlocked)
    expect(resolved.E).toBe(70000)
    expect(resolved.G).toBeCloseTo(rigidityModulus(steel), 9)
  })
})

describe('derived constants', () => {
  it('supplies G as E/2(1+ν) rather than any stored figure', () => {
    expect(resolveInputs(rel, vals, steel, none).G).toBeCloseTo(200000 / 2.6, 9)
  })

  it('keeps E, ν and G mutually consistent, which A-02 depends on', () => {
    const G = rigidityModulus(steel)
    expect(2 * G * (1 + steel.nu)).toBeCloseTo(steel.E, 6)
  })
})

describe('blank fields', () => {
  it('parses a cleared field to NaN, not 0', () => {
    const blank: Vals = { ...vals, 'T-01.P': '' }
    expect(resolveInputs(rel, blank, undefined, none).P).toBeNaN()
  })

  it('parses a missing field to NaN', () => {
    expect(resolveInputs(rel, {}, undefined, none).P).toBeNaN()
  })

  it('keeps a deliberate 0 as 0', () => {
    const zero: Vals = { ...vals, 'T-01.P': '0' }
    expect(resolveInputs(rel, zero, undefined, none).P).toBe(0)
  })
})

describe('solveRelation', () => {
  it('returns an empty readout instead of throwing', () => {
    const broken: Relation = {
      ...rel,
      solve: () => {
        throw new Error('boom')
      },
    }
    expect(solveRelation(broken, { P: 1 })).toEqual([])
  })

  it('passes results through untouched when the solve succeeds', () => {
    expect(solveRelation(rel, { P: 100, E: 200 })[0].val).toBe(0.5)
  })
})
