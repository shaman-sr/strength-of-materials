import type { Output } from '../types'
import { fmt } from '../lib/format'
import { nameFor } from '../lib/glossary'
import { MathText } from './MathText'
import { clarifyNegatives } from '../lib/mathText'

type Props = {
  relationId: string
  outputs: Output[]
}

/**
 * The results, and the reason the app exists.
 *
 * Each shows the value, then the formula, then the same formula with your
 * numbers put in. That last line is what lets you check the answer rather than
 * trust it. They tile so a relation with seven outputs still fits beside its
 * inputs.
 */
export function Results({ relationId, outputs }: Props) {
  if (outputs.length === 0) {
    return (
      <p className="results-empty">
        These values can't be solved. Check the inputs for anything left blank.
      </p>
    )
  }

  return (
    <div className="results">
      {outputs.map((o, i) => {
        const name = nameFor(relationId, o.sym)
        return (
          <div className="result" key={`${o.sym}-${i}`}>
            <p className="result-name">
              {name ? <span className="result-title">{name}</span> : null}
              <span className="result-sym">
                <MathText>{o.sym}</MathText>
              </span>
            </p>
            <p className="result-value">
              <span className="result-number">{fmt(o.val)}</span>
              {o.unit !== '—' && <span className="result-unit">{o.unit}</span>}
            </p>
            <div className="result-working">
              <div className="working-symbolic">
                <span className="working-eq">=</span>
                <MathText>{o.expr}</MathText>
              </div>
              {o.sub !== '—' && (
                <div className="working-numeric">
                  <span className="working-eq">=</span>
                  <MathText>{clarifyNegatives(o.sub)}</MathText>
                </div>
              )}
            </div>
            {o.note && <p className="result-note">{o.note}</p>}
          </div>
        )
      })}
    </div>
  )
}
