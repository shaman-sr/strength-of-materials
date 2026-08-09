import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

export const vessels: Chapter = {
  key: 'F',
  tab: 'Vessels',
  title: 'Pressure vessels',
  items: [
    {
      id: 'F-01',
      name: 'Thin cylindrical shell',
      headline: 'σ_h = pd/2t    σ_l = pd/4t',
      why: 'Valid while the wall is under about d/20, which covers most pipes and tanks.',
      steps: [
        { t: 'Thin means the stress can be taken as uniform through the wall and the radial stress ignored beside it.', eq: 't ≪ d' },
        { t: 'Slit the cylinder along its length for a length L. Pressure acts on the projected area d·L and is held by two wall strips.', eq: 'p·d·L = 2·σ_h·t·L' },
        { t: 'Cancel L. This is the hoop or circumferential stress — the one that splits pipes lengthwise.', eq: 'σ_h = pd/2t' },
        { t: 'Now cut across the cylinder. Pressure on the end cap is resisted by the whole ring of wall.', eq: 'p·πd²/4 = σ_l·πd·t' },
        { t: 'So the longitudinal stress is exactly half the hoop stress.', eq: 'σ_l = pd/4t' },
        { t: 'Maximum in-plane shear follows from the two principal stresses.', eq: 'τ_max = (σ_h − σ_l)/2 = pd/8t' },
      ],
      inputs: [
        { k: 'p', label: 'Internal pressure p', unit: 'MPa', def: 2 },
        { k: 'd', label: 'Internal diameter d', unit: 'mm', def: 1000 },
        { k: 't', label: 'Wall thickness t', unit: 'mm', def: 10 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'v', label: 'Poisson’s ratio ν', unit: '—', def: 0.3, mat: 'nu' },
      ],
      solve: ({ p, d, t, E, v }) => {
        const sh = (p * d) / (2 * t), sl = (p * d) / (4 * t)
        return [
          { sym: 'σ_h', unit: 'MPa', expr: 'p·d / 2t', sub: `${fmt(p)}×${fmt(d)} / (2×${fmt(t)})`, val: sh, note: 'hoop — governs' },
          { sym: 'σ_l', unit: 'MPa', expr: 'p·d / 4t', sub: `${fmt(p)}×${fmt(d)} / (4×${fmt(t)})`, val: sl },
          { sym: 'τ_max', unit: 'MPa', expr: 'p·d / 8t', sub: `${fmt(p)}×${fmt(d)} / (8×${fmt(t)})`, val: (p * d) / (8 * t) },
          { sym: 'ε_h', unit: '—', expr: '(σ_h − νσ_l)/E', sub: `(${fmt(sh)} − ${fmt(v)}×${fmt(sl)}) / ${fmt(E)}`, val: (sh - v * sl) / E },
          { sym: 'ε_v', unit: '—', expr: 'pd(5−4ν)/4tE', sub: `${fmt(p * d)}×${fmt(5 - 4 * v)} / (4×${fmt(t)}×${fmt(E)})`, val: (p * d * (5 - 4 * v)) / (4 * t * E), note: 'volumetric' },
          { sym: 'd/t', unit: '—', expr: 'd / t', sub: `${fmt(d)} / ${fmt(t)}`, val: d / t, note: d / t >= 20 ? 'thin-wall theory valid' : 'wall is thick — use F-03' },
        ]
      },
    },
    {
      id: 'F-02',
      name: 'Thin spherical shell',
      headline: 'σ = pd/4t',
      why: 'Same pressure, half the stress of a cylinder — which is why gas spheres are spheres.',
      steps: [
        { t: 'Cut the sphere through any great circle. Pressure acts on the circular projected area.', eq: 'p·πd²/4 = σ·πd·t' },
        { t: 'Every direction is identical, so both principal stresses are equal and there is no in-plane shear.', eq: 'σ = pd/4t' },
        { t: 'Strain in any direction from the biaxial state, and volumetric strain is three times it.', eq: 'ε_v = 3pd(1−ν)/4tE' },
      ],
      inputs: [
        { k: 'p', label: 'Internal pressure p', unit: 'MPa', def: 2 },
        { k: 'd', label: 'Internal diameter d', unit: 'mm', def: 1000 },
        { k: 't', label: 'Wall thickness t', unit: 'mm', def: 10 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'v', label: 'Poisson’s ratio ν', unit: '—', def: 0.3, mat: 'nu' },
      ],
      solve: ({ p, d, t, E, v }) => [
        { sym: 'σ', unit: 'MPa', expr: 'p·d / 4t', sub: `${fmt(p)}×${fmt(d)} / (4×${fmt(t)})`, val: (p * d) / (4 * t) },
        { sym: 'ε', unit: '—', expr: 'pd(1−ν)/4tE', sub: `${fmt(p * d)}×${fmt(1 - v)} / (4×${fmt(t)}×${fmt(E)})`, val: (p * d * (1 - v)) / (4 * t * E) },
        { sym: 'ε_v', unit: '—', expr: '3pd(1−ν)/4tE', sub: `3×${fmt(p * d)}×${fmt(1 - v)} / (4×${fmt(t)}×${fmt(E)})`, val: (3 * p * d * (1 - v)) / (4 * t * E) },
      ],
    },
    {
      id: 'F-03',
      name: 'Thick cylinder — Lamé’s equations',
      headline: 'σ_h = A + B/r²    σ_r = A − B/r²',
      why: 'Once the wall is thick the stress is far from uniform, and the bore is the critical point.',
      steps: [
        { t: 'Take a curved element of wall and balance it radially. Two hoop forces have a component pointing inward.', eq: 'σ_h = σ_r + r·dσ_r/dr' },
        { t: 'Assume sections perpendicular to the axis stay plane, so longitudinal strain is the same everywhere. With Hooke’s law that makes the sum of the two stresses constant.', eq: 'σ_h + σ_r = 2A' },
        { t: 'Eliminate σ_h between the two, integrate the resulting differential equation.', eq: 'σ_r = A − B/r²,  σ_h = A + B/r²' },
        { t: 'Fix A and B from the boundary conditions: σ_r = −p at the bore, zero at the outside.', eq: 'A = p r_i²/(r_o²−r_i²),  B = A·r_o²' },
        { t: 'Hoop stress is greatest at the bore, and it never drops below the internal pressure however thick you make the wall.', eq: 'σ_h,max = p(r_o²+r_i²)/(r_o²−r_i²)' },
      ],
      inputs: [
        { k: 'p', label: 'Internal pressure p', unit: 'MPa', def: 40 },
        { k: 'ri', label: 'Inner radius r_i', unit: 'mm', def: 100 },
        { k: 'ro', label: 'Outer radius r_o', unit: 'mm', def: 160 },
        { k: 'r', label: 'Radius of interest r', unit: 'mm', def: 100 },
      ],
      solve: ({ p, ri, ro, r }) => {
        const den = ro * ro - ri * ri
        const A = (p * ri * ri) / den
        const B = A * ro * ro
        return [
          { sym: 'A', unit: 'MPa', expr: 'p·r_i² / (r_o²−r_i²)', sub: `${fmt(p)}×${fmt(ri * ri)} / ${fmt(den)}`, val: A },
          { sym: 'B', unit: 'MPa·mm²', expr: 'A·r_o²', sub: `${fmt(A)}×${fmt(ro * ro)}`, val: B },
          { sym: 'σ_h', unit: 'MPa', expr: 'A + B/r²', sub: `${fmt(A)} + ${fmt(B)}/${fmt(r * r)}`, val: A + B / (r * r), note: `at r = ${fmt(r)} mm` },
          { sym: 'σ_r', unit: 'MPa', expr: 'A − B/r²', sub: `${fmt(A)} − ${fmt(B)}/${fmt(r * r)}`, val: A - B / (r * r) },
          { sym: 'σ_h,max', unit: 'MPa', expr: 'p(r_o²+r_i²)/(r_o²−r_i²)', sub: `${fmt(p)}×${fmt(ro * ro + ri * ri)} / ${fmt(den)}`, val: (p * (ro * ro + ri * ri)) / den, note: 'at the bore' },
        ]
      },
    },
  ],
}
