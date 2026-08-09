import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

const PI = Math.PI

export const torsion: Chapter = {
  key: 'B',
  tab: 'Torsion',
  title: 'Torsion of shafts',
  items: [
    {
      id: 'B-01',
      name: 'Torsion equation for circular shafts',
      headline: 'T/J = τ/r = Gθ/L',
      why: 'Twist, shear stress and torque tied together by one chain of equalities.',
      steps: [
        { t: 'Assume the shaft is circular, the material uniform, and that plane cross-sections stay plane with radii staying straight. One end rotates by θ relative to the other.', eq: '—' },
        { t: 'A line on the surface at radius r tilts by the shear strain γ. The same arc measured two ways gives:', eq: 'γ·L = r·θ  ⟹  γ = rθ/L' },
        { t: 'Hooke’s law in shear turns strain into stress, so stress grows linearly from zero at the centre.', eq: 'τ = Gγ = G r θ/L' },
        { t: 'A thin ring of area dA at radius r carries a force τ·dA at a lever arm r.', eq: 'dT = τ·r·dA = (Gθ/L) r² dA' },
        { t: 'Integrate over the section. The integral of r²dA is the polar second moment of area J.', eq: 'T = (Gθ/L)·J' },
        { t: 'Rearranging and reusing line 3 gives the full chain.', eq: 'T/J = τ/r = Gθ/L' },
      ],
      inputs: [
        { k: 'T', label: 'Torque T', unit: 'N·mm', def: 1500000 },
        { k: 'do', label: 'Outside diameter d_o', unit: 'mm', def: 60 },
        { k: 'di', label: 'Bore diameter d_i', unit: 'mm', def: 0 },
        { k: 'L', label: 'Length L', unit: 'mm', def: 1200 },
        { k: 'G', label: 'Rigidity modulus G', unit: 'MPa', def: 80000, mat: 'G' },
      ],
      // `do` is a reserved word, so it is renamed on destructuring.
      solve: ({ do: Do, di, T, L, G }) => {
        const J = (PI / 32) * (Math.pow(Do, 4) - Math.pow(di, 4))
        const t = (T * (Do / 2)) / J
        const th = (T * L) / (G * J)
        return [
          { sym: 'J', unit: 'mm⁴', expr: 'π(d_o⁴ − d_i⁴)/32', sub: `π×(${fmt(Math.pow(Do, 4))} − ${fmt(Math.pow(di, 4))})/32`, val: J },
          { sym: 'τ_max', unit: 'MPa', expr: 'T·r_o / J', sub: `${fmt(T)}×${fmt(Do / 2)} / ${fmt(J)}`, val: t, note: 'at the outer surface' },
          { sym: 'θ', unit: 'rad', expr: 'T·L / (G·J)', sub: `${fmt(T)}×${fmt(L)} / (${fmt(G)}×${fmt(J)})`, val: th },
          { sym: 'θ', unit: 'deg', expr: 'θ × 180/π', sub: `${fmt(th)} × 57.2958`, val: (th * 180) / PI },
          { sym: 'k_t', unit: 'N·mm/rad', expr: 'G·J / L', sub: `${fmt(G)}×${fmt(J)} / ${fmt(L)}`, val: (G * J) / L, note: 'torsional stiffness' },
        ]
      },
    },
    {
      id: 'B-02',
      name: 'Power transmitted by a shaft',
      headline: 'P = 2πNT / 60',
      why: 'Converts a machine rating into the torque the shaft section has to survive.',
      steps: [
        { t: 'Power is the rate of doing work; for a rotating shaft it is torque times angular velocity.', eq: 'P = T·ω' },
        { t: 'Angular velocity from rotational speed in rev/min.', eq: 'ω = 2πN/60' },
        { t: 'Combine, then invert to get the design torque.', eq: 'T = 60P / 2πN' },
      ],
      inputs: [
        { k: 'kW', label: 'Power', unit: 'kW', def: 30 },
        { k: 'N', label: 'Speed N', unit: 'rev/min', def: 900 },
      ],
      solve: ({ kW, N }) => {
        const T = (60 * kW * 1000) / (2 * PI * N)
        return [
          { sym: 'ω', unit: 'rad/s', expr: '2πN/60', sub: `2π×${fmt(N)}/60`, val: (2 * PI * N) / 60 },
          { sym: 'T', unit: 'N·m', expr: '60P / 2πN', sub: `60×${fmt(kW * 1000)} / (2π×${fmt(N)})`, val: T },
          { sym: 'T', unit: 'N·mm', expr: 'T × 1000', sub: `${fmt(T)} × 1000`, val: T * 1000, note: 'feed this into B-01' },
        ]
      },
    },
    {
      id: 'B-03',
      name: 'Shaft under combined bending and torsion',
      headline: 'M_e = ½(M + √(M²+T²))    T_e = √(M²+T²)',
      why: 'A real shaft bends and twists at once. These equivalents let you size it with the plain formulas.',
      steps: [
        { t: 'Bending gives a direct stress and torsion a shear stress on the same surface element.', eq: 'σ = 32M/πd³,  τ = 16T/πd³' },
        { t: 'Feed that element into the principal-stress result (G-01) with σ_y = 0.', eq: 'σ₁ = σ/2 + √((σ/2)² + τ²)' },
        { t: 'Substitute and factor out 32/πd³. What remains is a bending moment that alone would cause σ₁.', eq: 'M_e = ½(M + √(M² + T²))' },
        { t: 'Doing the same with maximum shear stress instead gives an equivalent torque.', eq: 'T_e = √(M² + T²)' },
      ],
      inputs: [
        { k: 'M', label: 'Bending moment M', unit: 'N·mm', def: 800000 },
        { k: 'T', label: 'Torque T', unit: 'N·mm', def: 1200000 },
        { k: 'd', label: 'Shaft diameter d', unit: 'mm', def: 60 },
      ],
      solve: ({ M, T, d }) => {
        const R = Math.sqrt(M * M + T * T)
        const Me = 0.5 * (M + R)
        const Z = (PI * Math.pow(d, 3)) / 32
        return [
          { sym: 'T_e', unit: 'N·mm', expr: '√(M² + T²)', sub: `√(${fmt(M * M)} + ${fmt(T * T)})`, val: R },
          { sym: 'M_e', unit: 'N·mm', expr: '½(M + T_e)', sub: `½×(${fmt(M)} + ${fmt(R)})`, val: Me },
          { sym: 'σ_max', unit: 'MPa', expr: '32·M_e / πd³', sub: `32×${fmt(Me)} / (π×${fmt(Math.pow(d, 3))})`, val: Me / Z },
          { sym: 'τ_max', unit: 'MPa', expr: '16·T_e / πd³', sub: `16×${fmt(R)} / (π×${fmt(Math.pow(d, 3))})`, val: R / (2 * Z) },
        ]
      },
    },
  ],
}
