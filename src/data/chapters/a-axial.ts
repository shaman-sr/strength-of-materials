import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

export const axial: Chapter = {
  key: 'A',
  tab: 'Axial',
  title: 'Axial loading',
  items: [
    {
      id: 'A-01',
      name: 'Direct stress, strain and extension',
      headline: 'σ = P/A    ε = δ/L    δ = PL/AE',
      why: 'The base case every other relation is built on: a straight bar pulled along its own axis.',
      steps: [
        { t: 'Cut the bar with a plane normal to its axis and keep one piece. For that piece to stay still, the cut face must carry an internal force equal to the applied load.', eq: 'ΣF = 0  ⟹  N = P' },
        { t: 'Far from the grips the internal force spreads evenly over the cut face (Saint-Venant). Stress is force per unit area.', eq: 'σ = N/A = P/A' },
        { t: 'Strain is the stretch measured against the original length, so it has no units.', eq: 'ε = δ/L' },
        { t: 'Below the proportional limit stress and strain rise together in a fixed ratio. That ratio is Young’s modulus.', eq: 'σ = E·ε' },
        { t: 'Put the first three lines into the fourth and rearrange for the extension.', eq: 'P/A = E·δ/L  ⟹  δ = PL/AE' },
      ],
      inputs: [
        { k: 'P', label: 'Axial load P', unit: 'N', def: 25000 },
        { k: 'A', label: 'Cross-section area A', unit: 'mm²', def: 450 },
        { k: 'L', label: 'Length L', unit: 'mm', def: 2000 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
      ],
      solve: ({ P, A, L, E }) => {
        const s = P / A, e = s / E, d = (P * L) / (A * E), k = (A * E) / L
        return [
          { sym: 'σ', unit: 'MPa', expr: 'P / A', sub: `${fmt(P)} / ${fmt(A)}`, val: s },
          { sym: 'ε', unit: '—', expr: 'σ / E', sub: `${fmt(s)} / ${fmt(E)}`, val: e },
          { sym: 'δ', unit: 'mm', expr: 'P·L / (A·E)', sub: `${fmt(P)}×${fmt(L)} / (${fmt(A)}×${fmt(E)})`, val: d },
          { sym: 'k', unit: 'N/mm', expr: 'A·E / L', sub: `${fmt(A)}×${fmt(E)} / ${fmt(L)}`, val: k, note: 'axial stiffness' },
        ]
      },
    },
    {
      id: 'A-02',
      name: 'Relations between the elastic constants',
      headline: 'E = 2G(1+ν) = 3K(1−2ν)',
      why: 'An isotropic material has only two independent constants. Given any two, the rest follow.',
      steps: [
        { t: 'A block in pure shear τ carries, on planes at 45°, a tension of τ and an equal compression.', eq: 'σ₁ = +τ,  σ₂ = −τ' },
        { t: 'Strain along the tension diagonal from that biaxial state (generalised Hooke’s law).', eq: 'ε = (σ₁ − ν σ₂)/E = τ(1+ν)/E' },
        { t: 'The same diagonal stretch measured from the shear distortion is half the shear strain.', eq: 'ε = γ/2 = τ/2G' },
        { t: 'The two descriptions are of one deformation, so equate them.', eq: 'G = E / 2(1+ν)' },
        { t: 'Now load all three faces with σ. Each direction strains by σ(1−2ν)/E, and volumetric strain is their sum.', eq: 'ε_v = 3σ(1−2ν)/E' },
        { t: 'Bulk modulus is pressure over volumetric strain.', eq: 'K = σ/ε_v = E / 3(1−2ν)' },
      ],
      inputs: [
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'v', label: 'Poisson’s ratio ν', unit: '—', def: 0.3, mat: 'nu' },
      ],
      solve: ({ E, v }) => {
        const G = E / (2 * (1 + v)), K = E / (3 * (1 - 2 * v))
        return [
          { sym: 'G', unit: 'MPa', expr: 'E / 2(1+ν)', sub: `${fmt(E)} / (2×${fmt(1 + v)})`, val: G, note: 'rigidity modulus' },
          { sym: 'K', unit: 'MPa', expr: 'E / 3(1−2ν)', sub: `${fmt(E)} / (3×${fmt(1 - 2 * v)})`, val: K, note: 'bulk modulus' },
          { sym: 'E', unit: 'MPa', expr: '9KG / (3K+G)', sub: `9×${fmt(K)}×${fmt(G)} / (3×${fmt(K)}+${fmt(G)})`, val: (9 * K * G) / (3 * K + G), note: 'check — returns E' },
        ]
      },
    },
    {
      id: 'A-03',
      name: 'Thermal stress in a restrained bar',
      headline: 'σ = E(α·ΔT − c/L)',
      why: 'Heating a bar that cannot move freely puts it in stress without any external load at all.',
      steps: [
        { t: 'Left alone, the bar would grow by its coefficient of expansion times length times temperature rise.', eq: 'δ_T = α·L·ΔT' },
        { t: 'A support that allows only a gap c must push the bar back by whatever growth is left over.', eq: 'δ_forced = α·L·ΔT − c' },
        { t: 'That push is an ordinary axial compression, so it obeys A-01.', eq: 'δ_forced = σ·L/E' },
        { t: 'Equate the two and cancel L.', eq: 'σ = E(α·ΔT − c/L)' },
      ],
      inputs: [
        { k: 'a', label: 'Expansion coeff. α', unit: '/°C', def: 0.000012, mat: 'alpha' },
        { k: 'dT', label: 'Temperature rise ΔT', unit: '°C', def: 60 },
        { k: 'L', label: 'Length L', unit: 'mm', def: 3000 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'c', label: 'Gap allowed c', unit: 'mm', def: 0 },
      ],
      solve: ({ a, dT, L, E, c }) => {
        const free = a * L * dT
        // The `free > c` test is false for NaN, which would report a confident
        // σ = 0 for a form that is merely blank. Propagate the NaN instead so
        // the readout shows "—"; zero is reserved for a bar that genuinely has
        // room left to expand into.
        const s = !isFinite(free) ? NaN : free > c ? E * (a * dT - c / L) : 0
        return [
          { sym: 'δ_free', unit: 'mm', expr: 'α·L·ΔT', sub: `${fmt(a)}×${fmt(L)}×${fmt(dT)}`, val: free },
          { sym: 'σ', unit: 'MPa', expr: 'E(α·ΔT − c/L)', sub: `${fmt(E)}×(${fmt(a * dT)} − ${fmt(c / L)})`, val: s, note: !isFinite(s) ? undefined : s > 0 ? 'compressive on heating' : 'gap not closed — bar free' },
          { sym: 'ε', unit: '—', expr: 'σ / E', sub: `${fmt(s)} / ${fmt(E)}`, val: s / E },
        ]
      },
    },
    {
      id: 'A-04',
      name: 'Generalised Hooke’s law, volumetric strain',
      headline: 'ε_x = [σ_x − ν(σ_y + σ_z)] / E',
      why: 'Stress in one direction shrinks the other two. Superpose the three effects to get any triaxial state.',
      steps: [
        { t: 'σ_x acting alone stretches x and, through Poisson’s ratio, contracts y and z.', eq: 'ε_x = σ_x/E,  ε_y = ε_z = −ν σ_x/E' },
        { t: 'Elasticity is linear, so the three stresses can be applied one at a time and the strains added.', eq: 'ε_x = [σ_x − ν(σ_y + σ_z)]/E' },
        { t: 'For small strains the volume change is the sum of the three direct strains.', eq: 'ε_v = ε_x + ε_y + ε_z' },
        { t: 'Adding the three expressions collapses the ν terms.', eq: 'ε_v = (σ_x + σ_y + σ_z)(1−2ν)/E' },
      ],
      inputs: [
        { k: 'sx', label: 'Direct stress σ_x', unit: 'MPa', def: 120 },
        { k: 'sy', label: 'Direct stress σ_y', unit: 'MPa', def: -40 },
        { k: 'sz', label: 'Direct stress σ_z', unit: 'MPa', def: 0 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'v', label: 'Poisson’s ratio ν', unit: '—', def: 0.3, mat: 'nu' },
      ],
      solve: ({ sx, sy, sz, E, v }) => {
        const ex = (sx - v * (sy + sz)) / E
        const ey = (sy - v * (sx + sz)) / E
        const ez = (sz - v * (sx + sy)) / E
        return [
          { sym: 'ε_x', unit: '—', expr: '[σ_x − ν(σ_y+σ_z)]/E', sub: `[${fmt(sx)} − ${fmt(v)}×${fmt(sy + sz)}] / ${fmt(E)}`, val: ex },
          { sym: 'ε_y', unit: '—', expr: '[σ_y − ν(σ_x+σ_z)]/E', sub: `[${fmt(sy)} − ${fmt(v)}×${fmt(sx + sz)}] / ${fmt(E)}`, val: ey },
          { sym: 'ε_z', unit: '—', expr: '[σ_z − ν(σ_x+σ_y)]/E', sub: `[${fmt(sz)} − ${fmt(v)}×${fmt(sx + sy)}] / ${fmt(E)}`, val: ez },
          { sym: 'ε_v', unit: '—', expr: '(σ_x+σ_y+σ_z)(1−2ν)/E', sub: `${fmt(sx + sy + sz)}×${fmt(1 - 2 * v)} / ${fmt(E)}`, val: ex + ey + ez },
        ]
      },
    },
  ],
}
