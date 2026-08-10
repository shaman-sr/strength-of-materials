/* The whole domain, in one file. Units are fixed everywhere: force in newtons,
   length in millimetres, so stress comes out in N/mm² which is a megapascal. */

/**
 * The specimen's cross-section, which is all we need to turn force into stress.
 *
 * The two named shapes are conveniences — they only save you the arithmetic.
 * `area` is the general case and takes any specimen at all: a tube, a hexagon,
 * a moulded dogbone, anything you can measure or look up the area of.
 */
export type Section =
  | { shape: 'circular'; diameter: number }
  | { shape: 'rectangular'; width: number; thickness: number }
  | { shape: 'area'; area: number }

export type Specimen = {
  name: string
  /** Original gauge length, mm. Strain is measured against this. */
  gaugeLength: number
  section: Section
}

/** One row of the test machine's output. */
export type Reading = {
  /** Applied force, N. */
  force: number
  /** Change in length, mm. */
  elongation: number
}

/** One row after normalising away the specimen's size. */
export type Point = {
  /** Engineering strain, a ratio (0.01 means 1%). */
  strain: number
  /** Engineering stress, MPa. */
  stress: number
}

/** A straight-line fit through the elastic region. */
export type Fit = {
  /** Slope, MPa. Divide by 1000 for GPa. */
  value: number
  /** Coefficient of determination; 1 is a perfect straight line. */
  rSquared: number
}

export type Analysis = {
  points: Point[]
  /** Original cross-sectional area, mm². Kept so the readings can be shown as
      the forces they were, not only as the stresses they became. */
  sectionArea: number
  /** Young's modulus. Null when too few points land in the fitting window. */
  modulus: Fit | null
  /** Yield by the 0.2% offset method. Null when the curve never crosses it. */
  yieldPoint: Point | null
  /** Maximum stress reached. */
  ultimate: Point
  /** The last point recorded, taken as the moment of fracture. */
  fracture: Point
  /** Strain at fracture, as a percentage. */
  elongationAtBreak: number
  behaviour: 'ductile' | 'brittle'
  /** Things the reader should know before trusting the numbers above. */
  warnings: string[]
}
