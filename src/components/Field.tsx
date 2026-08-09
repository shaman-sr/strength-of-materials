import type { Input, Material, Vals } from '../types'
import { fieldKey, isLocked, isOverridden, resolveFieldText } from '../lib/resolve'
import { MathText } from './MathText'

type Props = {
  relationId: string
  input: Input
  vals: Vals
  material: Material | undefined
  unlocked: ReadonlySet<string>
  onChange: (value: string) => void
  onUnlock: (key: string) => void
  onRelock: (key: string) => void
}

/**
 * One input.
 *
 * When the chosen material supplies a value, the field is filled in and
 * read-only, and says where the number came from. "Change" detaches that one
 * field so you can type your own without abandoning the material everywhere
 * else.
 */
export function Field({
  relationId,
  input,
  vals,
  material,
  unlocked,
  onChange,
  onUnlock,
  onRelock,
}: Props) {
  const key = fieldKey(relationId, input.k)
  const fixed = isLocked(relationId, input, material, unlocked)
  const changed = isOverridden(relationId, input, material, unlocked)
  const text = resolveFieldText(relationId, input, vals, material, unlocked)
  const inputId = `f-${relationId}-${input.k}`

  return (
    <div className="field">
      <label className="field-label" htmlFor={inputId}>
        <MathText>{input.label}</MathText>
      </label>
      <div
        className={`field-input${fixed ? ' field-fixed' : ''}${changed ? ' field-changed' : ''}`}
      >
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={text}
          readOnly={fixed}
          aria-readonly={fixed || undefined}
          aria-describedby={fixed ? `${inputId}-src` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {fixed ? (
          <span className="field-source" id={`${inputId}-src`}>
            <span>{input.unit !== '—' ? input.unit : ''} from material</span>
            <button
              type="button"
              className="field-edit"
              onClick={() => onUnlock(key)}
              title={`Enter your own value without changing the material`}
            >
              Change
            </button>
          </span>
        ) : (
          <span className="field-unit">{input.unit}</span>
        )}
      </div>
      {changed && (
        <button type="button" className="field-restore" onClick={() => onRelock(key)}>
          Changed by hand — use {material?.name} again
        </button>
      )}
    </div>
  )
}
