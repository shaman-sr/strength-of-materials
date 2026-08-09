import { useEffect, useMemo, useState } from 'react'
import type { IndexedRelation, Material, Output, Vals } from '../types'
import { resolveInputs, solveRelation } from '../lib/resolve'
import { Field } from './Field'
import { Results } from './Results'
import { MathText } from './MathText'
import { SaveBox } from './SaveBox'

type Props = {
  relation: IndexedRelation
  vals: Vals
  material: Material | undefined
  unlocked: ReadonlySet<string>
  justSaved: boolean
  /** Name of the saved calculation loaded into this relation, if any. */
  activeName: string | null
  onField: (inputKey: string, value: string) => void
  onUnlock: (key: string) => void
  onRelock: (key: string) => void
  onSaveNew: (name: string, inputs: Record<string, number>, outputs: Output[]) => void
  onUpdate: (name: string, inputs: Record<string, number>, outputs: Output[]) => void
  onStopEditing: () => void
  onReset: () => void
  onRecord: (inputs: Record<string, number>, outputs: Output[]) => void
}

/** The selected relation: inputs on the left, results on the right, and the
 *  derivation folded away underneath until it is asked for. */
export function RelationDetail({
  relation,
  vals,
  material,
  unlocked,
  justSaved,
  activeName,
  onField,
  onUnlock,
  onRelock,
  onSaveNew,
  onUpdate,
  onStopEditing,
  onReset,
  onRecord,
}: Props) {
  const [showDerivation, setShowDerivation] = useState(false)

  // Only the selected relation solves — the other 25 are not on screen.
  const { inputs, outputs } = useMemo(() => {
    const args = resolveInputs(relation, vals, material, unlocked)
    return { inputs: args, outputs: solveRelation(relation, args) }
  }, [relation, vals, material, unlocked])

  // Offer this state to the history log; the hook decides whether to keep it —
  // it waits for typing to settle and drops repeats.
  useEffect(() => {
    if (outputs.length === 0) return
    onRecord(inputs, outputs)
  }, [inputs, outputs, onRecord])

  // Choosing a different relation remounts this component — App keys it on the
  // relation id — so the derivation collapses again without an effect to do it.

  return (
    <section className="detail" aria-labelledby="detail-heading">
      <span className="detail-id">{relation.id}</span>
      <h2 id="detail-heading">{relation.name}</h2>
      <p className="detail-formula">
        <MathText>{relation.headline}</MathText>
      </p>
      <p className="detail-why">{relation.why}</p>

      <div className="calc">
        <div>
          <p className="block-label">Your values — newtons and millimetres</p>
          <div className="inputs">
            {relation.inputs.map((i) => (
              <Field
                key={i.k}
                relationId={relation.id}
                input={i}
                vals={vals}
                material={material}
                unlocked={unlocked}
                onChange={(v) => onField(i.k, v)}
                onUnlock={onUnlock}
                onRelock={onRelock}
              />
            ))}
          </div>
          <SaveBox
            key={activeName ?? '__new__'}
            activeName={activeName}
            defaultName={relation.name}
            justSaved={justSaved}
            onSaveNew={(name) => onSaveNew(name, inputs, outputs)}
            onUpdate={(name) => onUpdate(name, inputs, outputs)}
            onStopEditing={onStopEditing}
            onReset={onReset}
          />
        </div>

        <div>
          <p className="block-label">Results</p>
          <Results relationId={relation.id} outputs={outputs} />
        </div>
      </div>

      <div className="derivation">
        <button
          type="button"
          className="derivation-toggle"
          onClick={() => setShowDerivation((s) => !s)}
          aria-expanded={showDerivation}
        >
          <span aria-hidden="true">{showDerivation ? '▼' : '▶'}</span>
          {showDerivation
            ? 'Hide where these formulas come from'
            : 'Show where these formulas come from'}
        </button>

        {showDerivation && (
          <ol className="steps">
            {relation.steps.map((s, i) => (
              <li key={i}>
                <p className="step-text">
                  <MathText>{s.t}</MathText>
                </p>
                {s.eq !== '—' && (
                  <p className="step-eq">
                    <MathText>{s.eq}</MathText>
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
