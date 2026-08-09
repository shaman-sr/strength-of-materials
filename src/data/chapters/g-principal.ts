import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

const PI = Math.PI

export const principal: Chapter = {
  key: 'G',
  tab: 'Principal',
  title: 'Principal stress and failure',
  items: [
    {
      id: 'G-01',
      name: 'Principal stresses and maximum shear',
      headline: 'σ₁,₂ = (σ_x+σ_y)/2 ± √[((σ_x−σ_y)/2)² + τ_xy²]',
      why: 'Turns any messy 2D stress state into the two numbers a failure theory can use.',
      steps: [
        { t: 'Cut a wedge from the stressed element with its face at angle θ and resolve forces normal and tangential to that face.', eq: 'σ_θ = (σ_x+σ_y)/2 + ((σ_x−σ_y)/2)cos2θ + τ_xy sin2θ' },
        { t: 'The shear on the same face comes out as:', eq: 'τ_θ = −((σ_x−σ_y)/2)sin2θ + τ_xy cos2θ' },
        { t: 'Principal planes are where shear vanishes. Set τ_θ = 0.', eq: 'tan 2θ_p = 2τ_xy/(σ_x−σ_y)' },
        { t: 'Put that angle back into σ_θ. The two roots differ only in the sign of the radical.', eq: 'σ₁,₂ = σ_avg ± R' },
        { t: 'The radical is itself the largest shear stress, and it occurs 45° from the principal planes. Geometrically all of this is a circle of radius R centred at σ_avg — Mohr’s circle.', eq: 'τ_max = R = √[((σ_x−σ_y)/2)² + τ_xy²]' },
      ],
      inputs: [
        { k: 'sx', label: 'Direct stress σ_x', unit: 'MPa', def: 100 },
        { k: 'sy', label: 'Direct stress σ_y', unit: 'MPa', def: -40 },
        { k: 'txy', label: 'Shear stress τ_xy', unit: 'MPa', def: 50 },
      ],
      solve: ({ sx, sy, txy }) => {
        const avg = (sx + sy) / 2
        const R = Math.sqrt(Math.pow((sx - sy) / 2, 2) + txy * txy)
        const th = (0.5 * Math.atan2(2 * txy, sx - sy) * 180) / PI
        return [
          { sym: 'σ_avg', unit: 'MPa', expr: '(σ_x + σ_y)/2', sub: `(${fmt(sx)} + ${fmt(sy)})/2`, val: avg, note: 'circle centre' },
          { sym: 'R', unit: 'MPa', expr: '√[((σ_x−σ_y)/2)² + τ_xy²]', sub: `√(${fmt(Math.pow((sx - sy) / 2, 2))} + ${fmt(txy * txy)})`, val: R, note: 'circle radius' },
          { sym: 'σ₁', unit: 'MPa', expr: 'σ_avg + R', sub: `${fmt(avg)} + ${fmt(R)}`, val: avg + R },
          { sym: 'σ₂', unit: 'MPa', expr: 'σ_avg − R', sub: `${fmt(avg)} − ${fmt(R)}`, val: avg - R },
          { sym: 'τ_max', unit: 'MPa', expr: 'R', sub: `${fmt(R)}`, val: R },
          { sym: 'θ_p', unit: 'deg', expr: '½·atan[2τ_xy/(σ_x−σ_y)]', sub: `½×atan(${fmt(2 * txy)}/${fmt(sx - sy)})`, val: th },
        ]
      },
    },
    {
      id: 'G-02',
      name: 'Failure theories and factor of safety',
      headline: 'n = S_y / σ_equivalent',
      why: 'Three different answers to the same question: which combination of stresses counts as “as bad as” a tensile test?',
      steps: [
        { t: 'Rankine, maximum principal stress. Failure when the largest principal stress reaches yield. Suits brittle materials.', eq: 'σ_eq = max(|σ₁|, |σ₂|, |σ₃|)' },
        { t: 'Tresca, maximum shear stress. A tensile test yields at σ = S_y, where the peak shear is S_y/2, so failure comes when shear reaches that.', eq: 'σ_eq = σ_max − σ_min' },
        { t: 'Von Mises, distortion energy. Split strain energy into a volume-change part and a shape-change part; only the second causes yielding.', eq: 'σ_eq = √(σ₁² − σ₁σ₂ + σ₂²)' },
        { t: 'Divide yield strength by the equivalent stress. Tresca is the conservative one, von Mises the closest match to ductile test data.', eq: 'n = S_y/σ_eq' },
      ],
      inputs: [
        { k: 's1', label: 'Major principal stress σ₁', unit: 'MPa', def: 120 },
        { k: 's2', label: 'Minor principal stress σ₂', unit: 'MPa', def: -60 },
        { k: 'Sy', label: 'Yield strength S_y', unit: 'MPa', def: 250, mat: 'Sy' },
      ],
      // Plane stress, so the third principal stress is taken as zero when
      // forming the Tresca and Rankine sets.
      solve: ({ s1, s2, Sy }) => {
        const set = [s1, s2, 0]
        const rank = Math.max(...set.map(Math.abs))
        const tres = Math.max(...set) - Math.min(...set)
        const vm = Math.sqrt(s1 * s1 - s1 * s2 + s2 * s2)
        return [
          { sym: 'σ_Rankine', unit: 'MPa', expr: 'max|σ|', sub: `max(${fmt(Math.abs(s1))}, ${fmt(Math.abs(s2))}, 0)`, val: rank },
          { sym: 'n_Rankine', unit: '—', expr: 'S_y / σ_eq', sub: `${fmt(Sy)} / ${fmt(rank)}`, val: Sy / rank },
          { sym: 'σ_Tresca', unit: 'MPa', expr: 'σ_max − σ_min', sub: `${fmt(Math.max(...set))} − ${fmt(Math.min(...set))}`, val: tres },
          { sym: 'n_Tresca', unit: '—', expr: 'S_y / σ_eq', sub: `${fmt(Sy)} / ${fmt(tres)}`, val: Sy / tres, note: 'conservative' },
          { sym: 'σ_vonMises', unit: 'MPa', expr: '√(σ₁² − σ₁σ₂ + σ₂²)', sub: `√(${fmt(s1 * s1)} − ${fmt(s1 * s2)} + ${fmt(s2 * s2)})`, val: vm },
          { sym: 'n_vonMises', unit: '—', expr: 'S_y / σ_eq', sub: `${fmt(Sy)} / ${fmt(vm)}`, val: Sy / vm, note: 'usual choice for ductile metals' },
        ]
      },
    },
  ],
}
