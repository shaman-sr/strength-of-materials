import type { Row } from '../lib/rows'
import { stamp } from '../lib/format'

type Props = {
  title: string
  rows: Row[]
  emptyText: string
  clearLabel: string
  /** Marks the entry currently loaded into the calculator. */
  activeId?: string | null
  onRestore: (id: string) => void
  onDelete?: (id: string) => void
  onClear: () => void
}

/** Saved calculations and recent activity — the same list, differing only in
 *  how entries get into it. */
export function EntryList({
  title,
  rows,
  emptyText,
  clearLabel,
  activeId,
  onRestore,
  onDelete,
  onClear,
}: Props) {
  return (
    <section className="panel">
      <div className="panel-head">
        <span className="panel-title">
          {title} {rows.length > 0 && <span className="panel-count">{rows.length}</span>}
        </span>
        {rows.length > 0 && (
          <button type="button" className="link-btn" onClick={onClear}>
            {clearLabel}
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="panel-empty">{emptyText}</p>
      ) : (
        <ul className="entries">
          {rows.map((r) => (
            <li className={`entry${r.id === activeId ? ' entry-active' : ''}`} key={r.id}>
              <span className="entry-id">{r.relationId}</span>
              <button
                type="button"
                className="entry-main"
                onClick={() => onRestore(r.id)}
                title="Load these values back into the calculator"
              >
                <span className="entry-name">
                  {r.label}
                  {r.id === activeId && <span className="entry-badge">editing</span>}
                </span>
                <span className="entry-values">{r.summary}</span>
              </button>
              <span className="entry-date">{stamp(r.at)}</span>
              {onDelete && (
                <button
                  type="button"
                  className="entry-delete"
                  onClick={() => onDelete(r.id)}
                  aria-label={`Delete ${r.label}`}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
