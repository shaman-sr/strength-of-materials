/* Shared shapes for the whole app.
   The relation model comes from the project spec; `Input.mat` is the one
   addition, and it is what lets a material preset drive a field. */

/** A property an isotropic material carries, and that a relation input can bind to. */
export type MatProp = 'E' | 'G' | 'nu' | 'alpha' | 'Sy' | 'sigma_c'

/** One line of a result: symbol, value, the symbolic form, and the same form
 *  with the user's numbers written into it. The `sub` line is the point of
 *  the app — it is what makes a result teach rather than just compute. */
export type Output = {
  /** "σ_max" */
  sym: string
  /** "MPa" */
  unit: string
  /** symbolic form: "M·y / I" */
  expr: string
  /** same form with numbers substituted: "2.0e7×100 / 6.667e7" */
  sub: string
  val: number
  /** short qualifier, e.g. "at the outer surface" */
  note?: string
}

export type Input = {
  /** key used in the solve argument object, and in the vals store */
  k: string
  label: string
  unit: string
  def: number
  /** When set, this field is a material constant: a selected preset supplies
   *  its value and locks the field. Untagged fields are always user-typed. */
  mat?: MatProp
}

export type Step = {
  /** one plain sentence of physical reasoning */
  t: string
  /** the equation it produces; "—" renders the sentence alone */
  eq: string
}

export type Relation = {
  /** "C-03" */
  id: string
  name: string
  /** governing equation, shown while collapsed */
  headline: string
  /** one sentence on when you reach for it */
  why: string
  steps: Step[]
  inputs: Input[]
  solve: (v: Record<string, number>) => Output[]
}

export type Chapter = {
  key: string
  tab: string
  title: string
  items: Relation[]
}

/** A relation flattened with its chapter, for search and lookup. */
export type IndexedRelation = Relation & {
  ch: string
  chTitle: string
}

/** An isotropic material. Only E and ν are stored as elastic constants —
 *  G and K are derived, so the library can never contradict relation A-02. */
export type Material = {
  id: string
  name: string
  /** Young's modulus, MPa */
  E: number
  /** Poisson's ratio */
  nu: number
  /** coefficient of linear expansion, /°C */
  alpha: number
  /** yield strength, MPa */
  Sy: number
  /** crushing stress for Rankine–Gordon, MPa */
  sigma_c: number
  /** shown under the callout when the preset needs a caveat */
  note?: string
}

/** Raw field text, keyed `${relationId}.${inputKey}`.
 *  Stored as typed, not as a number: parsing on the way in would destroy
 *  mid-typing states like "1e" or "-" and turn a cleared field into 0. */
export type Vals = Record<string, string>

/** Field keys detached from the selected material by the per-field EDIT control. */
export type UnlockedSet = string[]

export type SavedCase = {
  id: string
  relationId: string
  name: string
  inputs: Record<string, number>
  outputs: Output[]
  materialId: string
  createdAt: number
}

export type HistoryEntry = {
  id: string
  relationId: string
  inputs: Record<string, number>
  outputs: Output[]
  materialId: string
  at: number
}

export type Theme = 'light' | 'dark'

export type UiState = {
  chapter: string
  openId: string | null
  query: string
  materialId: string
  unlocked: UnlockedSet
  theme: Theme
  /** The saved calculation currently loaded, so edits can update it in place
   *  instead of only ever piling up new copies. */
  activeCaseId: string | null
}
