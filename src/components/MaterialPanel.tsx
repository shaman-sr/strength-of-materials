import type { Material } from '../types'
import {
  CALLOUT_PROPS,
  CUSTOM_ID,
  MATERIALS,
  MAT_PROP_META,
  materialValue,
} from '../data/materials'
import { fmt } from '../lib/format'

type Props = {
  materialId: string
  material: Material | undefined
  overrideCount: number
  onChange: (id: string) => void
}

/**
 * Choose a material once and its constants fill in everywhere.
 *
 * This sits in the header rather than inside a calculator because the choice
 * belongs to the whole page: it fixes Young's modulus, Poisson's ratio, the
 * shear modulus, thermal expansion and yield strength across all 26 relations
 * at the same time.
 */
export function MaterialPanel({ materialId, material, overrideCount, onChange }: Props) {
  return (
    <div className="material">
      <div className="material-row">
        <label className="material-label" htmlFor="material-select">
          Material
        </label>
        <span className="select-wrap">
          <select id="material-select" value={materialId} onChange={(e) => onChange(e.target.value)}>
            <option value={CUSTOM_ID}>None — I'll enter every value myself</option>
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <span className="select-caret" aria-hidden="true">
            ▼
          </span>
        </span>
        {overrideCount > 0 && (
          <span className="override-chip">
            {overrideCount} value{overrideCount === 1 ? '' : 's'} changed by hand
          </span>
        )}
      </div>

      {material ? (
        <>
          <p className="constants">
            {CALLOUT_PROPS.map((prop) => (
              <span key={prop}>
                {MAT_PROP_META[prop].name} <b>{fmt(materialValue(material, prop))}</b>{' '}
                {MAT_PROP_META[prop].unit !== '—' && MAT_PROP_META[prop].unit}
                {prop === 'G' && <span className="derived-flag"> calculated</span>}
              </span>
            ))}
          </p>
          <p className="material-note">
            The shear modulus is calculated from the other two as E / 2(1 + ν) rather than
            looked up separately, so the three can never disagree with each other — which is
            exactly what relation A-02 is there to demonstrate.
            {material.note ? ` ${material.note}` : ''}
          </p>
        </>
      ) : (
        <p className="material-empty">
          No material chosen, so every value in every calculator is yours to type.
        </p>
      )}
    </div>
  )
}
