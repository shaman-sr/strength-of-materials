import type { Material, MatProp } from '../types'

/* The material library — the "constants are fixed" half of the app.
   Selecting one fills every material-tagged input across all 26 relations and
   locks those fields.

   Only E and ν are stored as elastic constants. G and K are DERIVED from them.
   Handbooks quote mild steel at E = 200 GPa, ν = 0.30 and G = 80 GPa, but
   E/2(1+ν) = 76.9 GPa — those three numbers cannot all be true at once. Storing
   G separately would make relation A-02, whose entire subject is that an
   isotropic material has only two independent constants, contradict the very
   library feeding it. Deriving keeps the library self-consistent and turns A-02
   into a real check.

   Everything in MPa, /°C, N, mm. */

export const CUSTOM_ID = 'custom'

export const MATERIALS: Material[] = [
  {
    id: 'mild-steel',
    name: 'Mild steel',
    E: 200000,
    nu: 0.3,
    alpha: 0.000012,
    Sy: 250,
    sigma_c: 320,
  },
  {
    id: 'alloy-steel',
    name: 'Alloy steel, high tensile',
    E: 205000,
    nu: 0.3,
    alpha: 0.000012,
    Sy: 450,
    sigma_c: 550,
  },
  {
    id: 'stainless-304',
    name: 'Stainless steel 304',
    E: 193000,
    nu: 0.3,
    alpha: 0.0000173,
    Sy: 215,
    sigma_c: 280,
    note: 'Expands about 45% more than carbon steel — check thermal cases (A-03).',
  },
  {
    id: 'cast-iron',
    name: 'Grey cast iron',
    E: 100000,
    nu: 0.26,
    alpha: 0.000011,
    Sy: 200,
    sigma_c: 550,
    note: 'Brittle: it has no yield point, so S_y here is the ultimate tensile strength. Use Rankine (G-02), not von Mises, and note it takes far more in compression than tension.',
  },
  {
    id: 'al-6061',
    name: 'Aluminium 6061-T6',
    E: 69000,
    nu: 0.33,
    alpha: 0.0000236,
    Sy: 276,
    sigma_c: 276,
  },
  {
    id: 'al-2024',
    name: 'Aluminium 2024-T4',
    E: 73000,
    nu: 0.33,
    alpha: 0.0000232,
    Sy: 324,
    sigma_c: 324,
  },
  {
    id: 'brass',
    name: 'Brass 70/30',
    E: 100000,
    nu: 0.34,
    alpha: 0.000019,
    Sy: 200,
    sigma_c: 200,
  },
  {
    id: 'copper',
    name: 'Copper, annealed',
    E: 117000,
    nu: 0.34,
    alpha: 0.000017,
    Sy: 70,
    sigma_c: 70,
  },
  {
    id: 'titanium',
    name: 'Titanium Ti-6Al-4V',
    E: 114000,
    nu: 0.34,
    alpha: 0.0000086,
    Sy: 880,
    sigma_c: 970,
  },
]

const BY_ID = new Map(MATERIALS.map((m) => [m.id, m]))

export const materialById = (id: string): Material | undefined => BY_ID.get(id)

/** Rigidity modulus, derived. G = E / 2(1+ν) */
export const rigidityModulus = (m: Material): number => m.E / (2 * (1 + m.nu))

/** Bulk modulus, derived. K = E / 3(1−2ν) */
export const bulkModulus = (m: Material): number => m.E / (3 * (1 - 2 * m.nu))

/** The value a material supplies for a given tagged input. */
export const materialValue = (m: Material, prop: MatProp): number => {
  switch (prop) {
    case 'E':
      return m.E
    case 'nu':
      return m.nu
    case 'alpha':
      return m.alpha
    case 'Sy':
      return m.Sy
    case 'sigma_c':
      return m.sigma_c
    case 'G':
      return rigidityModulus(m)
  }
}

/** Readable name and unit for each property, for the material panel. */
export const MAT_PROP_META: Record<MatProp, { name: string; sym: string; unit: string }> = {
  E: { name: "Young's modulus", sym: 'E', unit: 'MPa' },
  nu: { name: "Poisson's ratio", sym: 'ν', unit: '—' },
  G: { name: 'Shear modulus', sym: 'G', unit: 'MPa' },
  alpha: { name: 'Thermal expansion', sym: 'α', unit: '/°C' },
  Sy: { name: 'Yield strength', sym: 'S_y', unit: 'MPa' },
  sigma_c: { name: 'Crushing stress', sym: 'σ_c', unit: 'MPa' },
}

/** Reading order for the panel: the two measured constants, then the rest. */
export const CALLOUT_PROPS: MatProp[] = ['E', 'nu', 'G', 'alpha', 'Sy']
