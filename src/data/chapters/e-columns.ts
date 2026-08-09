import type { Chapter } from '../../types'
import { fmt } from '../../lib/format'

const PI = Math.PI

/** Euler's result is only meaningful above a certain slenderness — below it the
 *  column crushes before it can buckle, and E-02 is the honest answer. */
function slendernessNote(lambda: number): string {
  if (!isFinite(lambda)) return ''
  if (lambda < 40) return 'short — Euler not valid, use E-02'
  if (lambda < 80) return 'intermediate — check E-02 too'
  return 'slender — Euler governs'
}

export const columns: Chapter = {
  key: 'E',
  tab: 'Columns',
  title: 'Columns and buckling',
  items: [
    {
      id: 'E-01',
      name: 'Euler critical load',
      headline: 'P_cr = π²EI / (K·L)²',
      why: 'A slender strut fails by going sideways long before the material yields.',
      steps: [
        { t: 'Take a pin-ended column already bowed by a small amount y. The axial load then has a lever arm.', eq: 'M = −P·y' },
        { t: 'Substitute into the curvature relation and gather terms.', eq: 'y″ + k²y = 0,  k² = P/EI' },
        { t: 'The general solution of that equation is a sine and cosine pair.', eq: 'y = A sin kx + B cos kx' },
        { t: 'Zero deflection at the bottom kills B. Zero deflection at the top needs sin kL = 0, and A = 0 would mean no buckling at all.', eq: 'kL = nπ' },
        { t: 'The smallest useful root, n = 1, gives the critical load. Note it depends on stiffness and geometry only — not on strength.', eq: 'P_cr = π²EI/L²' },
        { t: 'Other end fixings change only the length of the half sine wave, absorbed into an effective length. Pinned K=1, fixed–fixed K=0.5, fixed–pinned K=0.7, fixed–free K=2.', eq: 'L_e = K·L' },
      ],
      inputs: [
        { k: 'E', label: 'Young’s modulus E', unit: 'MPa', def: 200000, mat: 'E' },
        { k: 'I', label: 'Least second moment I', unit: 'mm⁴', def: 2000000 },
        { k: 'L', label: 'Actual length L', unit: 'mm', def: 3000 },
        { k: 'K', label: 'End-condition factor K', unit: '—', def: 1 },
        { k: 'A', label: 'Area A', unit: 'mm²', def: 1500 },
      ],
      solve: ({ E, I, L, K, A }) => {
        const Le = K * L
        const Pcr = (PI * PI * E * I) / (Le * Le)
        const k = Math.sqrt(I / A)
        return [
          { sym: 'L_e', unit: 'mm', expr: 'K·L', sub: `${fmt(K)}×${fmt(L)}`, val: Le },
          { sym: 'P_cr', unit: 'N', expr: 'π²EI / L_e²', sub: `π²×${fmt(E)}×${fmt(I)} / ${fmt(Le * Le)}`, val: Pcr },
          { sym: 'σ_cr', unit: 'MPa', expr: 'P_cr / A', sub: `${fmt(Pcr)} / ${fmt(A)}`, val: Pcr / A },
          { sym: 'λ', unit: '—', expr: 'L_e / √(I/A)', sub: `${fmt(Le)} / ${fmt(k)}`, val: Le / k, note: slendernessNote(Le / k) },
        ]
      },
    },
    {
      id: 'E-02',
      name: 'Rankine–Gordon load',
      headline: 'P = σ_c·A / (1 + a(L_e/k)²)',
      why: 'Euler over-predicts for short columns. Rankine blends crushing and buckling into one curve.',
      steps: [
        { t: 'A short column crushes, a long one buckles. Take the reciprocals of both capacities and add them.', eq: '1/P = 1/P_c + 1/P_e' },
        { t: 'Substitute crushing load σ_c·A and Euler load π²EA/(L_e/k)².', eq: '1/P = 1/σ_cA + (L_e/k)²/π²EA' },
        { t: 'Rearrange and lump the material constants into a single empirical constant a = σ_c/π²E.', eq: 'P = σ_c·A / (1 + a(L_e/k)²)' },
        { t: 'Typical values: mild steel σ_c ≈ 320 MPa with a ≈ 1/7500; cast iron 550 MPa with a ≈ 1/1600.', eq: '—' },
      ],
      inputs: [
        { k: 'sc', label: 'Crushing stress σ_c', unit: 'MPa', def: 320, mat: 'sigma_c' },
        { k: 'A', label: 'Area A', unit: 'mm²', def: 1500 },
        { k: 'a', label: 'Rankine constant a', unit: '—', def: 0.000133 },
        { k: 'Le', label: 'Effective length L_e', unit: 'mm', def: 3000 },
        { k: 'kk', label: 'Radius of gyration k', unit: 'mm', def: 36.5 },
      ],
      solve: ({ sc, A, a, Le, kk }) => {
        const lam = Le / kk
        const P = (sc * A) / (1 + a * lam * lam)
        return [
          { sym: 'λ', unit: '—', expr: 'L_e / k', sub: `${fmt(Le)} / ${fmt(kk)}`, val: lam },
          { sym: 'P', unit: 'N', expr: 'σ_c·A / (1 + aλ²)', sub: `${fmt(sc)}×${fmt(A)} / (1 + ${fmt(a)}×${fmt(lam * lam)})`, val: P },
          { sym: 'σ', unit: 'MPa', expr: 'P / A', sub: `${fmt(P)} / ${fmt(A)}`, val: P / A },
        ]
      },
    },
  ],
}
