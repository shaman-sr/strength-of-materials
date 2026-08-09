import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

export const energy: Chapter = {
  key: 'H',
  tab: 'Energy',
  title: 'Strain energy and impact',
  items: [
    {
      id: 'H-01',
      name: 'Strain energy and resilience',
      headline: 'U = σ²V / 2E',
      why: 'The area under the load–extension curve. Also the gateway to Castigliano and to impact problems.',
      steps: [
        { t: 'A gradually applied load rises from zero to P while the bar stretches to δ, so the work done is the triangle under the graph.', eq: 'U = ½·P·δ' },
        { t: 'Substitute the extension from A-01.', eq: 'U = ½·P·(PL/AE) = P²L/2AE' },
        { t: 'Write it per unit volume by replacing P with σA and AL with V.', eq: 'U = σ²·V/2E' },
        { t: 'Energy per unit volume at the elastic limit is the modulus of resilience — the material’s ability to absorb shock without permanent set.', eq: 'u = σ²/2E' },
      ],
      inputs: [
        { k: 'P', label: 'Axial load P', unit: 'N', def: 25000 },
        { k: 'A', label: 'Area A', unit: 'mm²', def: 450 },
        { k: 'L', label: 'Length L', unit: 'mm', def: 2000 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
      ],
      solve: ({ P, A, L, E }) => {
        const s = P / A
        return [
          { sym: 'σ', unit: 'MPa', expr: 'P / A', sub: `${fmt(P)} / ${fmt(A)}`, val: s },
          { sym: 'U', unit: 'N·mm', expr: 'P²·L / 2AE', sub: `${fmt(P * P)}×${fmt(L)} / (2×${fmt(A)}×${fmt(E)})`, val: (P * P * L) / (2 * A * E) },
          { sym: 'U', unit: 'J', expr: 'N·mm / 1000', sub: `${fmt((P * P * L) / (2 * A * E))} / 1000`, val: (P * P * L) / (2 * A * E) / 1000 },
          { sym: 'u', unit: 'N·mm/mm³', expr: 'σ² / 2E', sub: `${fmt(s * s)} / (2×${fmt(E)})`, val: (s * s) / (2 * E), note: 'resilience per unit volume' },
        ]
      },
    },
    {
      id: 'H-02',
      name: 'Sudden and impact loading',
      headline: 'σ = (W/A)[1 + √(1 + 2hAE/WL)]',
      why: 'A weight dropped onto a bar produces far more stress than the same weight resting on it.',
      steps: [
        { t: 'The falling weight loses potential energy over the drop plus the extension it then causes.', eq: 'Work = W(h + δ)' },
        { t: 'All of it is stored as strain energy in the bar.', eq: 'U = σ²AL/2E,  δ = σL/E' },
        { t: 'Equate and rearrange into a quadratic in σ.', eq: 'σ² − (2W/A)σ − 2WhE/AL = 0' },
        { t: 'Take the positive root.', eq: 'σ = (W/A)[1 + √(1 + 2hAE/WL)]' },
        { t: 'Set h = 0 for a load released suddenly with no drop: the stress is exactly twice the static value.', eq: 'σ_sudden = 2W/A' },
      ],
      inputs: [
        { k: 'W', label: 'Falling weight W', unit: 'N', def: 1000 },
        { k: 'h', label: 'Drop height h', unit: 'mm', def: 50 },
        { k: 'A', label: 'Bar area A', unit: 'mm²', def: 300 },
        { k: 'L', label: 'Bar length L', unit: 'mm', def: 2000 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
      ],
      solve: ({ W, h, A, L, E }) => {
        const st = W / A
        const root = Math.sqrt(1 + (2 * h * A * E) / (W * L))
        const si = st * (1 + root)
        return [
          { sym: 'σ_gradual', unit: 'MPa', expr: 'W / A', sub: `${fmt(W)} / ${fmt(A)}`, val: st },
          { sym: 'σ_sudden', unit: 'MPa', expr: '2W / A', sub: `2×${fmt(W)} / ${fmt(A)}`, val: 2 * st },
          { sym: 'σ_impact', unit: 'MPa', expr: '(W/A)[1 + √(1 + 2hAE/WL)]', sub: `${fmt(st)}×(1 + ${fmt(root)})`, val: si },
          { sym: 'δ_impact', unit: 'mm', expr: 'σ·L / E', sub: `${fmt(si)}×${fmt(L)} / ${fmt(E)}`, val: (si * L) / E },
          { sym: '×', unit: '—', expr: 'σ_impact / σ_gradual', sub: `${fmt(si)} / ${fmt(st)}`, val: si / st, note: 'impact factor' },
        ]
      },
    },
    {
      id: 'H-03',
      name: 'Strain energy in torsion and bending',
      headline: 'U = T²L/2GJ    U = ∫M²dx/2EI',
      why: 'Same triangle-of-work argument, applied to twist and to curvature.',
      steps: [
        { t: 'A gradually applied torque does work equal to half the torque times the angle it turns through.', eq: 'U = ½·T·θ' },
        { t: 'Substitute the twist from the torsion equation B-01.', eq: 'U = ½·T·(TL/GJ) = T²L/2GJ' },
        { t: 'For bending, a short length dx rotates by dθ = M dx/EI, so the element stores ½M dθ.', eq: 'dU = M² dx / 2EI' },
        { t: 'Integrate along the beam. For a cantilever with an end load, M = Wx and the integral gives:', eq: 'U = W²L³/6EI' },
      ],
      inputs: [
        { k: 'T', label: 'Torque T', unit: 'N·mm', def: 1500000 },
        { k: 'L', label: 'Length L', unit: 'mm', def: 1200 },
        { k: 'G', label: 'Rigidity modulus G', unit: 'MPa', def: 80000, mat: 'G' },
        { k: 'J', label: 'Polar second moment J', unit: 'mm⁴', def: 1272345 },
        { k: 'W', label: 'Cantilever end load W', unit: 'N', def: 5000 },
        { k: 'EI', label: 'Flexural rigidity EI', unit: 'N·mm²', def: 4000000000000 },
      ],
      solve: ({ T, L, G, J, W, EI }) => [
        { sym: 'U_torsion', unit: 'N·mm', expr: 'T²·L / 2GJ', sub: `${fmt(T * T)}×${fmt(L)} / (2×${fmt(G)}×${fmt(J)})`, val: (T * T * L) / (2 * G * J) },
        { sym: 'θ', unit: 'rad', expr: 'T·L / GJ', sub: `${fmt(T)}×${fmt(L)} / (${fmt(G)}×${fmt(J)})`, val: (T * L) / (G * J) },
        { sym: 'U_bending', unit: 'N·mm', expr: 'W²·L³ / 6EI', sub: `${fmt(W * W)}×${fmt(Math.pow(L, 3))} / (6×${fmt(EI)})`, val: (W * W * Math.pow(L, 3)) / (6 * EI), note: 'cantilever, end load' },
        { sym: 'δ', unit: 'mm', expr: '2U / W  (Castigliano)', sub: `2×${fmt((W * W * Math.pow(L, 3)) / (6 * EI))} / ${fmt(W)}`, val: (W * Math.pow(L, 3)) / (3 * EI), note: 'matches D-03' },
      ],
    },
  ],
}
