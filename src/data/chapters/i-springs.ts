import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

const PI = Math.PI

export const springs: Chapter = {
  key: 'I',
  tab: 'Springs',
  title: 'Helical springs',
  items: [
    {
      id: 'I-01',
      name: 'Close-coiled helical spring',
      headline: 'τ = 8WD/πd³    δ = 8WD³n/Gd⁴',
      why: 'A spring is a long torsion bar wrapped up. Both results fall straight out of B-01.',
      steps: [
        { t: 'Close-coiled means the helix angle is small enough that a section of wire sees pure torsion. The load acts at the coil radius.', eq: 'T = W·D/2' },
        { t: 'Apply the torsion equation to the wire.', eq: 'τ = 16T/πd³ = 8WD/πd³' },
        { t: 'Curvature crowds the stress on the inside of the coil. Wahl’s factor corrects for it, with spring index C = D/d.', eq: 'K = (4C−1)/(4C−4) + 0.615/C' },
        { t: 'Total wire length is the circumference times the number of coils; the wire twists by that much.', eq: 'θ = TL/GJ,  L = πDn' },
        { t: 'The axial deflection is the twist times the coil radius. Substituting J = πd⁴/32 gives:', eq: 'δ = 8WD³n/Gd⁴' },
        { t: 'Stiffness is load over deflection — note the fourth power on wire diameter.', eq: 'k = Gd⁴/8D³n' },
      ],
      inputs: [
        { k: 'W', label: 'Axial load W', unit: 'N', def: 500 },
        { k: 'D', label: 'Mean coil diameter D', unit: 'mm', def: 60 },
        { k: 'd', label: 'Wire diameter d', unit: 'mm', def: 8 },
        { k: 'n', label: 'Active coils n', unit: '—', def: 10 },
        { k: 'G', label: 'Rigidity modulus G', unit: 'MPa', def: 80000, mat: 'G' },
      ],
      solve: ({ W, D, d, n, G }) => {
        const C = D / d
        const K = (4 * C - 1) / (4 * C - 4) + 0.615 / C
        const t = (8 * W * D) / (PI * Math.pow(d, 3))
        const del = (8 * W * Math.pow(D, 3) * n) / (G * Math.pow(d, 4))
        return [
          { sym: 'C', unit: '—', expr: 'D / d', sub: `${fmt(D)} / ${fmt(d)}`, val: C, note: 'spring index, keep 4–12' },
          { sym: 'τ', unit: 'MPa', expr: '8WD / πd³', sub: `8×${fmt(W)}×${fmt(D)} / (π×${fmt(Math.pow(d, 3))})`, val: t },
          { sym: 'K_Wahl', unit: '—', expr: '(4C−1)/(4C−4) + 0.615/C', sub: `${fmt((4 * C - 1) / (4 * C - 4))} + ${fmt(0.615 / C)}`, val: K },
          { sym: 'τ_corrected', unit: 'MPa', expr: 'K·τ', sub: `${fmt(K)}×${fmt(t)}`, val: K * t, note: 'peak, inside of coil' },
          { sym: 'δ', unit: 'mm', expr: '8WD³n / Gd⁴', sub: `8×${fmt(W)}×${fmt(Math.pow(D, 3))}×${fmt(n)} / (${fmt(G)}×${fmt(Math.pow(d, 4))})`, val: del },
          { sym: 'k', unit: 'N/mm', expr: 'Gd⁴ / 8D³n', sub: `${fmt(G)}×${fmt(Math.pow(d, 4))} / (8×${fmt(Math.pow(D, 3))}×${fmt(n)})`, val: (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * n) },
          { sym: 'U', unit: 'N·mm', expr: '½·W·δ', sub: `½×${fmt(W)}×${fmt(del)}`, val: 0.5 * W * del, note: 'energy stored' },
        ]
      },
    },
  ],
}
