import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Output } from './types'
import { ALL, CHAPTERS, relationById, searchRelations } from './data/chapters'
import { CUSTOM_ID } from './data/materials'
import { isEphemeral, stampSchema } from './lib/storage'
import { CSS } from './styles/app.css'
import { useVals } from './hooks/useVals'
import { useUiState } from './hooks/useUiState'
import { useSavedCases } from './hooks/useSavedCases'
import { useHistory } from './hooks/useHistory'
import { Header } from './components/Header'
import { ChapterTabs } from './components/ChapterTabs'
import { SearchField } from './components/SearchField'
import { RelationList } from './components/RelationList'
import { RelationDetail } from './components/RelationDetail'
import { EntryList } from './components/EntryList'
import { caseRow, historyRow } from './lib/rows'

export default function App() {
  const { vals, setField, applyInputs, resetRelation } = useVals()
  const {
    ui,
    material,
    unlocked,
    setChapter,
    setQuery,
    openRelation,
    setActiveCase,
    setMaterialId,
    unlockField,
    relockField,
    toggleTheme,
  } = useUiState()
  const { cases, saveCase, updateCase, deleteCase, clearCases } = useSavedCases()
  const { history, record, clearHistory } = useHistory()

  const [savedFor, setSavedFor] = useState<string | null>(null)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Probed once, lazily: the answer cannot change within a session.
  const [ephemeral] = useState(() => isEphemeral())

  useEffect(() => {
    stampSchema()
    return () => {
      if (savedTimer.current !== null) clearTimeout(savedTimer.current)
    }
  }, [])

  const searching = ui.query.trim().length > 0
  const listed = useMemo(
    () => (searching ? searchRelations(ui.query) : ALL.filter((it) => it.ch === ui.chapter)),
    [searching, ui.query, ui.chapter],
  )

  // Master–detail always shows something: fall back to the first item in the
  // list when the stored selection is not part of it.
  const selected = useMemo(() => {
    const stored = ui.openId ? relationById(ui.openId) : undefined
    if (stored && listed.some((r) => r.id === stored.id)) return stored
    return listed[0]
  }, [ui.openId, listed])

  const chapterTitle = CHAPTERS.find((c) => c.key === ui.chapter)?.title ?? ''

  const flashSaved = useCallback((relationId: string) => {
    setSavedFor(relationId)
    if (savedTimer.current !== null) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSavedFor(null), 2400)
  }, [])

  /** The saved calculation currently loaded, if it still exists and still
   *  belongs to the relation on screen. */
  const activeCase = useMemo(
    () => cases.find((c) => c.id === ui.activeCaseId) ?? null,
    [cases, ui.activeCaseId],
  )

  const handleSaveNew = useCallback(
    (
      relationId: string,
      name: string,
      inputs: Record<string, number>,
      outputs: Output[],
    ) => {
      const rel = relationById(relationId)
      const entry = saveCase(
        relationId,
        name || rel?.name || relationId,
        inputs,
        outputs,
        ui.materialId,
      )
      // Carry on editing the copy just made, rather than silently leaving the
      // original loaded and inviting the next Update to hit the wrong one.
      setActiveCase(entry.id)
      flashSaved(relationId)
    },
    [saveCase, setActiveCase, flashSaved, ui.materialId],
  )

  const handleUpdate = useCallback(
    (
      relationId: string,
      name: string,
      inputs: Record<string, number>,
      outputs: Output[],
    ) => {
      if (!ui.activeCaseId) return
      updateCase(ui.activeCaseId, name, inputs, outputs, ui.materialId)
      flashSaved(relationId)
    },
    [updateCase, flashSaved, ui.activeCaseId, ui.materialId],
  )

  const restore = useCallback(
    (relationId: string, inputs: Record<string, number>, materialId: string) => {
      // Put the values back and let the calculator recompute. Stored results
      // stay a record of that moment and never stand in for a live result, so
      // a corrected formula cannot be masked by a stale one.
      applyInputs(relationId, inputs)
      setMaterialId(materialId)
      openRelation(relationId)
    },
    [applyInputs, setMaterialId, openRelation],
  )

  const handleRestoreCase = useCallback(
    (id: string) => {
      const found = cases.find((c) => c.id === id)
      if (!found) return
      restore(found.relationId, found.inputs, found.materialId)
      setActiveCase(found.id)
    },
    [cases, restore, setActiveCase],
  )

  const handleDeleteCase = useCallback(
    (id: string) => {
      deleteCase(id)
      // Nothing to update once it is gone.
      if (ui.activeCaseId === id) setActiveCase(null)
    },
    [deleteCase, setActiveCase, ui.activeCaseId],
  )

  const handleClearCases = useCallback(() => {
    clearCases()
    setActiveCase(null)
  }, [clearCases, setActiveCase])

  const handleRestoreHistory = useCallback(
    (id: string) => {
      const found = history.find((e) => e.id === id)
      if (!found) return
      restore(found.relationId, found.inputs, found.materialId)
      // History entries are not saved calculations, so this starts a new one.
      setActiveCase(null)
    },
    [history, restore, setActiveCase],
  )

  const caseRows = useMemo(() => cases.map(caseRow), [cases])
  const historyRows = useMemo(() => history.map(historyRow), [history])

  return (
    <div className="app">
      <style>{CSS}</style>

      <Header
        materialId={ui.materialId}
        material={material}
        overrideCount={ui.unlocked.length}
        theme={ui.theme}
        onMaterialChange={setMaterialId}
        onToggleTheme={toggleTheme}
      />

      <div className="wrap">
        <ChapterTabs
          chapters={CHAPTERS}
          active={ui.chapter}
          searching={searching}
          onSelect={setChapter}
        />

        <SearchField value={ui.query} onChange={setQuery} />

        {ephemeral && (
          <div className="notice">
            This browser isn't letting the page save anything, so your values will only last
            until you close the tab. Private browsing is the usual reason.
          </div>
        )}

        <div className="browser">
          <div className="list-col">
            <p className="list-head">
              {searching
                ? `${listed.length} result${listed.length === 1 ? '' : 's'}`
                : chapterTitle}
            </p>
            {listed.length === 0 ? (
              <p className="panel-empty">
                Nothing matches that. Try buckling, hoop stress, twist or slenderness.
              </p>
            ) : (
              <RelationList
                relations={listed}
                selectedId={selected?.id ?? null}
                showTopic={searching}
                onSelect={openRelation}
              />
            )}
          </div>

          {selected && (
            <RelationDetail
              key={selected.id}
              relation={selected}
              vals={vals}
              material={material}
              unlocked={unlocked}
              justSaved={savedFor === selected.id}
              activeName={
                activeCase && activeCase.relationId === selected.id ? activeCase.name : null
              }
              onField={(k, v) => setField(selected.id, k, v)}
              onUnlock={unlockField}
              onRelock={relockField}
              onSaveNew={(name, inputs, outputs) =>
                handleSaveNew(selected.id, name, inputs, outputs)
              }
              onUpdate={(name, inputs, outputs) =>
                handleUpdate(selected.id, name, inputs, outputs)
              }
              onStopEditing={() => setActiveCase(null)}
              onReset={() => resetRelation(selected)}
              onRecord={(inputs, outputs) => record(selected.id, inputs, outputs, ui.materialId)}
            />
          )}
        </div>

        <div className="panels">
          <EntryList
            title="Saved calculations"
            rows={caseRows}
            emptyText="Nothing saved yet. Enter your values, give them a name, then press Save calculation."
            clearLabel="Delete all"
            activeId={ui.activeCaseId}
            onRestore={handleRestoreCase}
            onDelete={handleDeleteCase}
            onClear={handleClearCases}
          />

          <EntryList
            title="Recent activity"
            rows={historyRows}
            emptyText="Calculations you make are listed here automatically."
            clearLabel="Clear history"
            onRestore={handleRestoreHistory}
            onClear={clearHistory}
          />
        </div>

        <footer className="footer">
          <p>
            Everything here assumes elastic, isotropic material and small strains. Results are
            nominal values — apply your own stress concentration, fatigue and code factors
            before committing to a size.
          </p>
          <p>
            {ui.materialId === CUSTOM_ID
              ? 'No material is chosen, so every constant is whatever you typed.'
              : 'Material properties come from the panel at the top. Published figures vary between sources, so check them against your own standard before relying on a result.'}
          </p>
        </footer>
      </div>
    </div>
  )
}
