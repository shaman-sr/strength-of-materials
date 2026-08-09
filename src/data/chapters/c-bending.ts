import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

const PI = Math.PI

export const bending: Chapter = {
  key: 'C',
  tab: 'Bending',
  title: 'Bending and shear in beams',
  items: [
    {
      id: 'C-01',
      name: 'Rectangular section properties',
      headline: 'I = bh³/12    Z = bh²/6',
      why: 'Everything in bending needs I and Z first.',
      steps: [
        { t: 'Take a strip of thickness dy at height y from the centroidal axis. Its area is b·dy.', eq: 'dI = y²·b·dy' },
        { t: 'Integrate across the full depth, from −h/2 to +h/2.', eq: 'I = b[y³/3] = bh³/12' },
        { t: 'Section modulus is I divided by the distance to the extreme fibre, h/2.', eq: 'Z = I/(h/2) = bh²/6' },
        { t: 'Radius of gyration packages area and I into one length, used for columns.', eq: 'k = √(I/A)' },
      ],
      inputs: [
        { k: 'b', label: 'Width b', unit: 'mm', def: 100 },
        { k: 'h', label: 'Depth h', unit: 'mm', def: 200 },
      ],
      solve: ({ b, h }) => {
        const A = b * h, I = (b * Math.pow(h, 3)) / 12
        return [
          { sym: 'A', unit: 'mm²', expr: 'b·h', sub: `${fmt(b)}×${fmt(h)}`, val: A },
          { sym: 'I', unit: 'mm⁴', expr: 'b·h³/12', sub: `${fmt(b)}×${fmt(Math.pow(h, 3))}/12`, val: I },
          { sym: 'Z', unit: 'mm³', expr: 'b·h²/6', sub: `${fmt(b)}×${fmt(h * h)}/6`, val: (b * h * h) / 6 },
          { sym: 'k', unit: 'mm', expr: '√(I/A)', sub: `√(${fmt(I)}/${fmt(A)})`, val: Math.sqrt(I / A) },
        ]
      },
    },
    {
      id: 'C-02',
      name: 'Circular and tubular section properties',
      headline: 'I = π(d_o⁴−d_i⁴)/64    J = 2I',
      why: 'The tube result also shows why hollow shafts are so efficient.',
      steps: [
        { t: 'Use a ring of radius r and thickness dr, area 2πr·dr, and build the polar second moment first.', eq: 'dJ = r²·2πr dr' },
        { t: 'Integrate from the bore to the outside radius.', eq: 'J = π(d_o⁴ − d_i⁴)/32' },
        { t: 'By symmetry the section is identical about any diameter, and J = I_x + I_y = 2I.', eq: 'I = J/2 = π(d_o⁴ − d_i⁴)/64' },
      ],
      inputs: [
        { k: 'do', label: 'Outside diameter d_o', unit: 'mm', def: 80 },
        { k: 'di', label: 'Bore diameter d_i', unit: 'mm', def: 50 },
      ],
      solve: ({ do: Do, di }) => {
        const A = (PI / 4) * (Do * Do - di * di)
        const I = (PI / 64) * (Math.pow(Do, 4) - Math.pow(di, 4))
        return [
          { sym: 'A', unit: 'mm²', expr: 'π(d_o² − d_i²)/4', sub: `π×(${fmt(Do * Do)} − ${fmt(di * di)})/4`, val: A },
          { sym: 'I', unit: 'mm⁴', expr: 'π(d_o⁴ − d_i⁴)/64', sub: `π×(${fmt(Math.pow(Do, 4))} − ${fmt(Math.pow(di, 4))})/64`, val: I },
          { sym: 'J', unit: 'mm⁴', expr: '2·I', sub: `2×${fmt(I)}`, val: 2 * I },
          { sym: 'Z', unit: 'mm³', expr: 'I/(d_o/2)', sub: `${fmt(I)}/${fmt(Do / 2)}`, val: I / (Do / 2) },
          { sym: 'k', unit: 'mm', expr: '√(I/A)', sub: `√(${fmt(I)}/${fmt(A)})`, val: Math.sqrt(I / A) },
        ]
      },
    },
    {
      id: 'C-03',
      name: 'Flexure formula (bending stress)',
      headline: 'M/I = σ/y = E/R',
      why: 'The single most used equation in beam design.',
      steps: [
        { t: 'In pure bending an initially straight beam curves to radius R. Plane sections stay plane, so the top shortens and the bottom lengthens with one unstretched layer between.', eq: '— neutral surface —' },
        { t: 'A fibre at distance y from that layer had length Rθ and now has (R+y)θ.', eq: 'ε = yθ/(Rθ) = y/R' },
        { t: 'Hooke’s law turns that into stress varying linearly through the depth.', eq: 'σ = Eε = Ey/R' },
        { t: 'There is no net axial force on the section, so the stress integral must vanish — which forces the neutral axis through the centroid.', eq: '∫σ dA = (E/R)∫y dA = 0' },
        { t: 'The moment of those stresses about the neutral axis is the bending moment.', eq: 'M = ∫σ y dA = (E/R)∫y² dA = EI/R' },
        { t: 'Eliminate R between lines 3 and 5.', eq: 'M/I = σ/y = E/R' },
      ],
      inputs: [
        { k: 'M', label: 'Bending moment M', unit: 'N·mm', def: 20000000 },
        { k: 'I', label: 'Second moment I', unit: 'mm⁴', def: 66670000 },
        { k: 'y', label: 'Distance to fibre y', unit: 'mm', def: 100 },
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
      ],
      solve: ({ M, I, y, E }) => {
        const s = (M * y) / I
        return [
          { sym: 'σ', unit: 'MPa', expr: 'M·y / I', sub: `${fmt(M)}×${fmt(y)} / ${fmt(I)}`, val: s },
          { sym: 'Z', unit: 'mm³', expr: 'I / y', sub: `${fmt(I)} / ${fmt(y)}`, val: I / y, note: 'section modulus at this fibre' },
          { sym: 'R', unit: 'mm', expr: 'E·I / M', sub: `${fmt(E)}×${fmt(I)} / ${fmt(M)}`, val: (E * I) / M, note: 'radius of curvature' },
          { sym: 'ε', unit: '—', expr: 'σ / E', sub: `${fmt(s)} / ${fmt(E)}`, val: s / E },
        ]
      },
    },
    {
      id: 'C-04',
      name: 'Transverse shear stress in a beam',
      headline: 'τ = V·Q / (I·b)',
      why: 'Bending stress governs deep beams; this one governs short, stubby ones and welds.',
      steps: [
        { t: 'Take a slice of beam dx long. The bending moment on the two faces differs by dM, so the bending forces on the part of the section above a level y do not balance.', eq: 'dF = ∫(dM·y/I) dA' },
        { t: 'The only thing that can restore balance is a horizontal shear on the plane at that level, acting over width b and length dx.', eq: 'τ·b·dx = (dM/I)∫y dA' },
        { t: 'The integral is the first moment of the area above the level about the neutral axis.', eq: 'Q = A′·ȳ' },
        { t: 'Divide by dx and use the beam relation dM/dx = V. Complementary shear makes the vertical stress equal to the horizontal one.', eq: 'τ = V·Q/(I·b)' },
        { t: 'Applied to a rectangle the distribution is parabolic and peaks at the neutral axis at 1.5 times the average.', eq: 'τ_max = 3V/2A (rect),  4V/3A (circle)' },
      ],
      inputs: [
        { k: 'V', label: 'Shear force V', unit: 'N', def: 40000 },
        { k: 'Q', label: 'First moment Q = A′ȳ', unit: 'mm³', def: 500000 },
        { k: 'I', label: 'Second moment I', unit: 'mm⁴', def: 66670000 },
        { k: 'b', label: 'Width at that level b', unit: 'mm', def: 100 },
        { k: 'A', label: 'Total area A (for peaks)', unit: 'mm²', def: 20000 },
      ],
      solve: ({ V, Q, I, b, A }) => [
        { sym: 'τ', unit: 'MPa', expr: 'V·Q / (I·b)', sub: `${fmt(V)}×${fmt(Q)} / (${fmt(I)}×${fmt(b)})`, val: (V * Q) / (I * b) },
        { sym: 'τ_avg', unit: 'MPa', expr: 'V / A', sub: `${fmt(V)} / ${fmt(A)}`, val: V / A },
        { sym: 'τ_max', unit: 'MPa', expr: '1.5·V/A  (rectangle)', sub: `1.5×${fmt(V)}/${fmt(A)}`, val: (1.5 * V) / A },
        { sym: 'τ_max', unit: 'MPa', expr: '1.333·V/A  (solid circle)', sub: `1.333×${fmt(V)}/${fmt(A)}`, val: (4 * V) / (3 * A) },
      ],
    },
  ],
}
