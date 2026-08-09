import type { IndexedRelation } from '../types'

type Props = {
  relations: IndexedRelation[]
  selectedId: string | null
  /** Search results span topics, so each row names its own. */
  showTopic: boolean
  onSelect: (id: string) => void
}

/**
 * The list of relations, which stays in place while you work in the panel
 * beside it. Picking one swaps the panel — you never scroll past a calculator
 * to reach the next.
 */
export function RelationList({ relations, selectedId, showTopic, onSelect }: Props) {
  return (
    <ul className="relation-list">
      {relations.map((r) => {
        const on = r.id === selectedId
        return (
          <li key={r.id}>
            <button
              type="button"
              className={`relation-item${on ? ' relation-item-on' : ''}`}
              aria-current={on ? 'true' : undefined}
              onClick={() => onSelect(r.id)}
            >
              <span className="relation-item-id">{r.id}</span>
              <span className="relation-item-name">{r.name}</span>
              {showTopic && <span className="relation-item-topic">{r.chTitle}</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
