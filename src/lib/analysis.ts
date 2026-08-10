/* Turning raw test readings into material properties. This is the only real
   logic in the app; everything else is a library or a component. Pure
   functions, no React, so it can all be tested directly. */

import type { Analysis, Fit, Point, Reading, Section, Specimen } from '../types'

/** Fraction of ultimate stress where the straight-line fit starts. Below this
    the curve is dominated by the toe region — grips bedding in, slack taking
    up — which is not material behaviour and would flatten the slope. */
const FIT_LOW = 0.05
/** Where the fit stops. Comfortably below yield for the usual metals. */
const FIT_HIGH = 0.4
/** The offset used for yield strength, 0.2% strain. This is the convention. */
const OFFSET = 0.002
/** Elongation at break above which we call the material ductile. */
const DUCTILE_ELONGATION = 5

/** Original cross-sectional area, mm². */
export const area = (section: Section): number => {
  switch (section.shape) {
    case 'circular':
      return (Math.PI * section.diameter ** 2) / 4
    case 'rectangular':
      return section.width * section.thickness
    case 'area':
      return section.area
  }
}

/**
 * Normalise readings into stress and strain, discarding anything unusable.
 *
 * A row survives only if both numbers are finite; a machine export routinely
 * carries blank trailing cells or a text marker where the test was paused.
 * Dropping them quietly would be dishonest, so the count comes back too.
 */
export const toPoints = (
  readings: Reading[],
  specimen: Specimen,
): { points: Point[]; dropped: number } => {
  const a = area(specimen.section)
  const points: Point[] = []
  let dropped = 0

  for (const r of readings) {
    if (!isFinite(r.force) || !isFinite(r.elongation)) {
      dropped++
      continue
    }
    points.push({ strain: r.elongation / specimen.gaugeLength, stress: r.force / a })
  }
  return { points, dropped }
}

/** The point of maximum stress — the ultimate tensile strength. */
export const ultimate = (points: Point[]): Point =>
  points.reduce((best, p) => (p.stress > best.stress ? p : best), points[0])

/**
 * Young's modulus: a least-squares line through the elastic region.
 *
 * The line is not forced through the origin. A real test almost always shows a
 * small offset at zero load, and pinning the fit to (0, 0) would drag the slope
 * off to absorb it.
 */
export const fitModulus = (points: Point[], ultimateStress: number): Fit | null => {
  const window = points.filter(
    (p) => p.stress >= FIT_LOW * ultimateStress && p.stress <= FIT_HIGH * ultimateStress,
  )
  if (window.length < 3) return null

  const n = window.length
  const meanX = window.reduce((s, p) => s + p.strain, 0) / n
  const meanY = window.reduce((s, p) => s + p.stress, 0) / n

  let sxy = 0
  let sxx = 0
  for (const p of window) {
    sxy += (p.strain - meanX) * (p.stress - meanY)
    sxx += (p.strain - meanX) ** 2
  }
  if (sxx === 0) return null

  const slope = sxy / sxx
  const intercept = meanY - slope * meanX

  let residual = 0
  let total = 0
  for (const p of window) {
    residual += (p.stress - (slope * p.strain + intercept)) ** 2
    total += (p.stress - meanY) ** 2
  }
  const rSquared = total === 0 ? 1 : 1 - residual / total

  return { value: slope, rSquared }
}

/**
 * Yield strength by the 0.2% offset method.
 *
 * Draw a line of the same slope as the elastic region but shifted right by
 * 0.002 strain, and take the yield point where the measured curve crosses it.
 * A brittle material fractures before that line catches up, so there is no
 * crossing and no yield strength to report — null, not a guess.
 */
export const offsetYield = (points: Point[], modulus: number): Point | null => {
  const gap = (p: Point) => p.stress - modulus * (p.strain - OFFSET)

  for (let i = 1; i < points.length; i++) {
    const before = gap(points[i - 1])
    const after = gap(points[i])
    if (before > 0 && after <= 0) {
      const t = before / (before - after)
      return {
        strain: points[i - 1].strain + t * (points[i].strain - points[i - 1].strain),
        stress: points[i - 1].stress + t * (points[i].stress - points[i - 1].stress),
      }
    }
  }
  return null
}

/**
 * The whole characterisation, from readings to properties.
 *
 * Returns null only when there is not enough data to plot anything at all.
 * Every other shortcoming becomes a warning, because a partial answer with its
 * limitations stated is more useful than a refusal.
 */
export const analyze = (readings: Reading[], specimen: Specimen): Analysis | null => {
  if (!isFinite(specimen.gaugeLength) || specimen.gaugeLength <= 0) return null
  if (!isFinite(area(specimen.section)) || area(specimen.section) <= 0) return null

  const { points, dropped } = toPoints(readings, specimen)
  if (points.length < 2) return null

  const warnings: string[] = []
  if (dropped > 0) {
    warnings.push(
      `${dropped} ${dropped === 1 ? 'row was' : 'rows were'} skipped because the force or elongation could not be read as a number.`,
    )
  }
  if (points.length < 5) {
    warnings.push(
      `Only ${points.length} readings were usable. The curve and the properties drawn from it are rough.`,
    )
  }

  const peak = ultimate(points)
  const modulus = fitModulus(points, peak.stress)
  if (!modulus) {
    warnings.push(
      'Young’s modulus could not be measured: too few readings fall in the straight part of the curve, below 40% of the ultimate stress.',
    )
  } else if (modulus.rSquared < 0.98) {
    warnings.push(
      `The elastic region is not very straight (R² = ${modulus.rSquared.toFixed(3)}), so Young’s modulus is less reliable than the other properties.`,
    )
  }

  const yieldPoint = modulus ? offsetYield(points, modulus.value) : null
  if (modulus && !yieldPoint) {
    warnings.push(
      'No 0.2% offset yield point was found. The specimen fractured before yielding, which is what a brittle material does.',
    )
  }

  const fracture = points[points.length - 1]
  const elongationAtBreak = fracture.strain * 100

  return {
    points,
    sectionArea: area(specimen.section),
    modulus,
    yieldPoint,
    ultimate: peak,
    fracture,
    elongationAtBreak,
    behaviour: elongationAtBreak > DUCTILE_ELONGATION ? 'ductile' : 'brittle',
    warnings,
  }
}
