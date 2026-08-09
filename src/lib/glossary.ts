/* Plain-English names for the symbols a result can carry.

   The symbols themselves are standard notation and stay — σ is not jargon to
   anyone using this. But a symbol alone makes you recall what it stands for,
   and there is no reason to charge the reader for that when the screen has
   room to just say it.

   Exact matches only. A symbol with no entry simply shows without a name,
   which is better than guessing and labelling something wrongly. */

const NAMES: Record<string, string> = {
  // Direct stress and strain
  'σ': 'Stress',
  'σ_max': 'Maximum stress',
  'σ_avg': 'Average of the direct stresses',
  'σ_cr': 'Critical buckling stress',
  'σ_gradual': 'Stress, load applied gradually',
  'σ_sudden': 'Stress, load applied suddenly',
  'σ_impact': 'Stress under impact',
  'ε': 'Strain',
  'ε_x': 'Strain along x',
  'ε_y': 'Strain along y',
  'ε_z': 'Strain along z',
  'ε_v': 'Volumetric strain',
  'ε_h': 'Hoop strain',
  'δ': 'Extension',
  'δ_max': 'Maximum deflection',
  'δ_free': 'Free thermal expansion',
  'δ_impact': 'Deflection under impact',

  // Shear and torsion
  'τ': 'Shear stress',
  'τ_max': 'Maximum shear stress',
  'τ_avg': 'Average shear stress',
  'τ_corrected': 'Shear stress corrected for coil curvature',
  'θ': 'Angle of twist',
  'θ_end': 'Slope at the end',
  'θ_p': 'Angle to the principal plane',
  'ω': 'Angular velocity',

  // Pressure vessels
  'σ_h': 'Hoop stress',
  'σ_h,max': 'Maximum hoop stress, at the bore',
  'σ_l': 'Longitudinal stress',
  'σ_r': 'Radial stress',
  'd/t': 'Diameter to thickness ratio',

  // Principal stress and failure
  'σ₁': 'Major principal stress',
  'σ₂': 'Minor principal stress',
  'σ_Rankine': 'Equivalent stress, maximum principal stress theory',
  'σ_Tresca': 'Equivalent stress, maximum shear stress theory',
  'σ_vonMises': 'Equivalent stress, distortion energy theory',
  'n_Rankine': 'Factor of safety, Rankine',
  'n_Tresca': 'Factor of safety, Tresca',
  'n_vonMises': 'Factor of safety, von Mises',

  // Section properties
  'A': 'Cross-sectional area',
  'I': 'Second moment of area',
  'J': 'Polar second moment of area',
  'Z': 'Section modulus',
  'k': 'Radius of gyration',
  'R': 'Radius',

  // Elastic constants
  'E': "Young's modulus",
  'G': 'Shear modulus',
  'K': 'Bulk modulus',

  // Loads and internal actions
  'P': 'Load',
  'P_cr': 'Critical buckling load',
  'T': 'Torque',
  'T_e': 'Equivalent torque',
  'M_e': 'Equivalent bending moment',
  'M_max': 'Maximum bending moment',
  'V_max': 'Maximum shear force',
  'L_e': 'Effective length',
  'λ': 'Slenderness ratio',

  // Stiffness
  'k_t': 'Torsional stiffness',

  // Energy
  'U': 'Strain energy',
  'u': 'Strain energy per unit volume',
  'U_torsion': 'Strain energy stored in torsion',
  'U_bending': 'Strain energy stored in bending',

  // Springs
  'C': 'Spring index',
  'K_Wahl': "Wahl's stress correction factor",
}

/** Context-specific overrides, keyed `${relationId}.${symbol}` — used where the
 *  same symbol means different things in different relations. */
const BY_RELATION: Record<string, string> = {
  'A-01.k': 'Axial stiffness',
  'I-01.k': 'Spring rate',
  'I-01.δ': 'Deflection under load',
  'C-03.R': 'Radius of curvature',
  'D-01.R': 'Reaction at each support',
  'G-01.R': "Radius of Mohr's circle",
  'F-03.A': 'Lamé constant A',
  'F-03.B': 'Lamé constant B',
  'H-03.δ': 'Deflection, from Castigliano’s theorem',
  'H-02.×': 'Impact factor',
  'E-01.k': 'Radius of gyration',
}

export const nameFor = (relationId: string, sym: string): string | undefined =>
  BY_RELATION[`${relationId}.${sym}`] ?? NAMES[sym]
