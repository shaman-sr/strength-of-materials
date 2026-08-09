import { useState } from 'react'

type Props = {
  /** Name of the saved calculation currently loaded, or null if this is new. */
  activeName: string | null
  defaultName: string
  justSaved: boolean
  onSaveNew: (name: string) => void
  onUpdate: (name: string) => void
  onStopEditing: () => void
  onReset: () => void
}

/**
 * Naming and saving, kept next to the inputs.
 *
 * Editing happens in the calculator, so the save controls belong there too —
 * you name a case where you are already looking, not by hunting for it in a
 * list further down the page.
 *
 * With a saved calculation loaded, Update overwrites it and Save as new forks
 * it. With nothing loaded there is only Save, and no ambiguity about which of
 * the two is about to happen.
 */
export function SaveBox({
  activeName,
  defaultName,
  justSaved,
  onSaveNew,
  onUpdate,
  onStopEditing,
  onReset,
}: Props) {
  const editing = activeName !== null

  // Seeded once. RelationDetail keys this component on what is loaded, so
  // restoring a saved calculation or switching relations remounts it with the
  // right name — no effect needed to chase the props.
  const [name, setName] = useState(activeName ?? defaultName)

  return (
    <div className={`savebox${editing ? ' savebox-editing' : ''}`}>
      {editing && (
        <p className="savebox-status">
          Editing <strong>{activeName}</strong>
          <button type="button" className="link-btn" onClick={onStopEditing}>
            Stop editing
          </button>
        </p>
      )}

      <label className="field-label" htmlFor="case-name">
        Name this calculation
      </label>
      <input
        id="case-name"
        className="savebox-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={defaultName}
      />

      <div className="savebox-actions">
        {editing ? (
          <>
            <button type="button" className="btn btn-primary" onClick={() => onUpdate(name)}>
              Update
            </button>
            <button type="button" className="btn" onClick={() => onSaveNew(name)}>
              Save as new
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => onSaveNew(name)}>
            Save calculation
          </button>
        )}
        <button type="button" className="btn btn-quiet" onClick={onReset}>
          Reset values
        </button>
        {justSaved && <span className="saved-confirm">Saved</span>}
      </div>
    </div>
  )
}
