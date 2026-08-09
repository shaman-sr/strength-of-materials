import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

/* D-01 is derived in full from EI·y″ = M. The other three cite the same two
   integrations and differ only in their boundary conditions. */

export const deflection: Chapter = {
  key: 'D',
  tab: 'Deflection',
  title: 'Beam deflection — standard cases',
  items: [
    {
      id: 'D-01',
      name: 'Simply supported, central point load',
      headline: 'M = WL/4    δ = WL³/48EI',
      why: 'Derived here in full; the remaining cases use the same two integrations.',
      steps: [
        { t: 'Curvature is proportional to bending moment — this is the flexure formula with 1/R written in Cartesian form for small slopes.', eq: 'EI·d²y/dx² = M(x)' },
        { t: 'Symmetry gives each reaction as half the load, so for the left half the moment rises linearly.', eq: 'M = (W/2)x' },
        { t: 'Integrate once for slope, once for deflection, carrying two constants.', eq: 'EI·y = Wx³/12 + C₁x + C₂' },
        { t: 'Zero deflection at x = 0 kills C₂. Zero slope at midspan by symmetry fixes C₁ = −WL²/16.', eq: 'C₁ = −WL²/16' },
        { t: 'Evaluate at midspan, x = L/2. The sign just means downward.', eq: 'δ = WL³/48EI' },
      ],
      inputs: [
        { k: 'W', label: 'Point load W', unit: 'N', def: 20000 },
        { k: 'L', label: 'Span L', unit: 'mm', def: 4000 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'I', label: 'Second moment I', unit: 'mm⁴', def: 66670000 },
      ],
      solve: ({ W, L, E, I }) => [
        { sym: 'R', unit: 'N', expr: 'W / 2', sub: `${fmt(W)}/2`, val: W / 2, note: 'each support' },
        { sym: 'V_max', unit: 'N', expr: 'W / 2', sub: `${fmt(W)}/2`, val: W / 2 },
        { sym: 'M_max', unit: 'N·mm', expr: 'W·L / 4', sub: `${fmt(W)}×${fmt(L)}/4`, val: (W * L) / 4, note: 'at midspan' },
        { sym: 'δ_max', unit: 'mm', expr: 'W·L³ / 48EI', sub: `${fmt(W)}×${fmt(Math.pow(L, 3))} / (48×${fmt(E)}×${fmt(I)})`, val: (W * Math.pow(L, 3)) / (48 * E * I) },
        { sym: 'θ_end', unit: 'rad', expr: 'W·L² / 16EI', sub: `${fmt(W)}×${fmt(L * L)} / (16×${fmt(E)}×${fmt(I)})`, val: (W * L * L) / (16 * E * I) },
      ],
    },
    {
      id: 'D-02',
      name: 'Simply supported, uniformly distributed load',
      headline: 'M = wL²/8    δ = 5wL⁴/384EI',
      why: 'Self-weight and floor loading almost always reduce to this case.',
      steps: [
        { t: 'Each reaction carries half the total load wL.', eq: 'R = wL/2' },
        { t: 'Moment at x from the left, treating the load to the left of the cut as a resultant at its centroid.', eq: 'M = (wL/2)x − wx²/2' },
        { t: 'Integrate twice; y = 0 at both supports fixes the constants.', eq: 'EI·y = wLx³/12 − wx⁴/24 − wL³x/24' },
        { t: 'Maximum moment at midspan where shear crosses zero, maximum deflection at the same point.', eq: 'M = wL²/8,  δ = 5wL⁴/384EI' },
      ],
      inputs: [
        { k: 'w', label: 'Load intensity w', unit: 'N/mm', def: 15 },
        { k: 'L', label: 'Span L', unit: 'mm', def: 4000 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'I', label: 'Second moment I', unit: 'mm⁴', def: 66670000 },
      ],
      solve: ({ w, L, E, I }) => [
        { sym: 'V_max', unit: 'N', expr: 'w·L / 2', sub: `${fmt(w)}×${fmt(L)}/2`, val: (w * L) / 2 },
        { sym: 'M_max', unit: 'N·mm', expr: 'w·L² / 8', sub: `${fmt(w)}×${fmt(L * L)}/8`, val: (w * L * L) / 8 },
        { sym: 'δ_max', unit: 'mm', expr: '5w·L⁴ / 384EI', sub: `5×${fmt(w)}×${fmt(Math.pow(L, 4))} / (384×${fmt(E)}×${fmt(I)})`, val: (5 * w * Math.pow(L, 4)) / (384 * E * I) },
        { sym: 'θ_end', unit: 'rad', expr: 'w·L³ / 24EI', sub: `${fmt(w)}×${fmt(Math.pow(L, 3))} / (24×${fmt(E)}×${fmt(I)})`, val: (w * Math.pow(L, 3)) / (24 * E * I) },
      ],
    },
    {
      id: 'D-03',
      name: 'Cantilever, point load at the free end',
      headline: 'M = WL    δ = WL³/3EI',
      why: 'Brackets, overhangs and anything fixed at one end only.',
      steps: [
        { t: 'Measure x from the free end. The moment is the load times its distance back to the cut.', eq: 'M = −Wx' },
        { t: 'Integrate twice with the fixed end providing both conditions: zero slope and zero deflection at x = L.', eq: 'EI·y = −Wx³/6 + C₁x + C₂' },
        { t: 'Apply the conditions and evaluate at the free end.', eq: 'δ = WL³/3EI,  θ = WL²/2EI' },
      ],
      inputs: [
        { k: 'W', label: 'Point load W', unit: 'N', def: 5000 },
        { k: 'L', label: 'Length L', unit: 'mm', def: 1500 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'I', label: 'Second moment I', unit: 'mm⁴', def: 20000000 },
      ],
      solve: ({ W, L, E, I }) => [
        { sym: 'M_max', unit: 'N·mm', expr: 'W·L', sub: `${fmt(W)}×${fmt(L)}`, val: W * L, note: 'at the fixed end' },
        { sym: 'δ_max', unit: 'mm', expr: 'W·L³ / 3EI', sub: `${fmt(W)}×${fmt(Math.pow(L, 3))} / (3×${fmt(E)}×${fmt(I)})`, val: (W * Math.pow(L, 3)) / (3 * E * I) },
        { sym: 'θ_end', unit: 'rad', expr: 'W·L² / 2EI', sub: `${fmt(W)}×${fmt(L * L)} / (2×${fmt(E)}×${fmt(I)})`, val: (W * L * L) / (2 * E * I) },
      ],
    },
    {
      id: 'D-04',
      name: 'Cantilever, uniformly distributed load',
      headline: 'M = wL²/2    δ = wL⁴/8EI',
      why: 'The self-weight case for any overhang.',
      steps: [
        { t: 'The load on a length x from the free end acts at its own centroid, x/2 from the cut.', eq: 'M = −wx²/2' },
        { t: 'Two integrations with zero slope and zero deflection at the fixed end.', eq: 'EI·y = −wx⁴/24 + C₁x + C₂' },
        { t: 'Evaluate at the free end.', eq: 'δ = wL⁴/8EI,  θ = wL³/6EI' },
      ],
      inputs: [
        { k: 'w', label: 'Load intensity w', unit: 'N/mm', def: 8 },
        { k: 'L', label: 'Length L', unit: 'mm', def: 1500 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'I', label: 'Second moment I', unit: 'mm⁴', def: 20000000 },
      ],
      solve: ({ w, L, E, I }) => [
        { sym: 'M_max', unit: 'N·mm', expr: 'w·L² / 2', sub: `${fmt(w)}×${fmt(L * L)}/2`, val: (w * L * L) / 2 },
        { sym: 'δ_max', unit: 'mm', expr: 'w·L⁴ / 8EI', sub: `${fmt(w)}×${fmt(Math.pow(L, 4))} / (8×${fmt(E)}×${fmt(I)})`, val: (w * Math.pow(L, 4)) / (8 * E * I) },
        { sym: 'θ_end', unit: 'rad', expr: 'w·L³ / 6EI', sub: `${fmt(w)}×${fmt(Math.pow(L, 3))} / (6×${fmt(E)}×${fmt(I)})`, val: (w * Math.pow(L, 3)) / (6 * E * I) },
      ],
    },
  ],
}
