import { useCallback, useEffect, useMemo } from 'react'
import type { Theme, UiState } from '../types'
import { CHAPTERS, relationById } from '../data/chapters'
import { CUSTOM_ID, materialById } from '../data/materials'
import { KEYS, hasKeys, load } from '../lib/storage'
import { usePersistentState } from './usePersistentState'

const DEFAULT_UI: UiState = {
  chapter: 'A',
  openId: 'A-01',
  query: '',
  materialId: CUSTOM_ID,
  unlocked: [],
  theme: 'light',
  activeCaseId: null,
}

const isUiState = (v: unknown): v is UiState =>
  hasKeys(v, ['chapter', 'openId', 'query', 'materialId', 'unlocked', 'theme'])

/** What the operating system asks for, used only until the user chooses. */
const systemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

/** Reject anything that no longer names a real chapter, relation or material —
 *  a stored id can outlive the thing it pointed at. */
function sanitise(raw: UiState): UiState {
  const chapter = CHAPTERS.some((c) => c.key === raw.chapter) ? raw.chapter : DEFAULT_UI.chapter
  const openId = raw.openId && relationById(raw.openId) ? raw.openId : null
  const materialId =
    raw.materialId === CUSTOM_ID || materialById(raw.materialId)
      ? raw.materialId
      : CUSTOM_ID
  return {
    chapter,
    openId,
    query: typeof raw.query === 'string' ? raw.query : '',
    materialId,
    unlocked: Array.isArray(raw.unlocked) ? raw.unlocked.filter((k) => typeof k === 'string') : [],
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    activeCaseId: typeof raw.activeCaseId === 'string' ? raw.activeCaseId : null,
  }
}

/** Chapter, open card, search text, selected material, per-field overrides and
 *  theme — everything needed to put the user back exactly where they were. */
export function useUiState() {
  const [ui, setUi] = usePersistentState<UiState>(KEYS.ui, () => {
    // Fall back to null rather than DEFAULT_UI, so "nothing stored" is
    // distinguishable from "stored" and the system theme can win on a first
    // visit without overriding a choice the user has already made.
    const stored = load<UiState | null>(KEYS.ui, null, (v): v is UiState => isUiState(v))
    if (!stored) return { ...DEFAULT_UI, theme: systemTheme() }
    return sanitise({ ...DEFAULT_UI, ...stored })
  })

  const material = useMemo(
    () => (ui.materialId === CUSTOM_ID ? undefined : materialById(ui.materialId)),
    [ui.materialId],
  )

  const unlocked = useMemo(() => new Set(ui.unlocked), [ui.unlocked])

  const setChapter = useCallback(
    (chapter: string) => setUi((p) => ({ ...p, chapter, query: '' })),
    [setUi],
  )

  const setQuery = useCallback((query: string) => setUi((p) => ({ ...p, query })), [setUi])

  const toggleOpen = useCallback(
    (id: string) => setUi((p) => ({ ...p, openId: p.openId === id ? null : id })),
    [setUi],
  )

  const openRelation = useCallback(
    (id: string) => {
      const rel = relationById(id)
      setUi((p) => ({
        ...p,
        openId: id,
        chapter: rel ? rel.ch : p.chapter,
        // A saved calculation belongs to one relation; moving to another means
        // you are no longer editing it.
        activeCaseId: p.openId === id ? p.activeCaseId : null,
      }))
    },
    [setUi],
  )

  /** Mark which saved calculation is loaded, so Save can offer to update it. */
  const setActiveCase = useCallback(
    (activeCaseId: string | null) => setUi((p) => ({ ...p, activeCaseId })),
    [setUi],
  )

  const setMaterialId = useCallback(
    (materialId: string) =>
      // Overrides belong to the material they were made against; carrying them
      // to a different one would silently misreport the new material.
      setUi((p) => ({ ...p, materialId, unlocked: [] })),
    [setUi],
  )

  const unlockField = useCallback(
    (key: string) =>
      setUi((p) => (p.unlocked.includes(key) ? p : { ...p, unlocked: [...p.unlocked, key] })),
    [setUi],
  )

  const relockField = useCallback(
    (key: string) => setUi((p) => ({ ...p, unlocked: p.unlocked.filter((k) => k !== key) })),
    [setUi],
  )

  const setTheme = useCallback((theme: Theme) => setUi((p) => ({ ...p, theme })), [setUi])

  const toggleTheme = useCallback(
    () => setUi((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' })),
    [setUi],
  )

  // The theme has to reach <html> as well as the sheet, so the page behind the
  // component (and the browser's own scrollbar) matches.
  useEffect(() => {
    document.documentElement.dataset.theme = ui.theme
  }, [ui.theme])

  return {
    ui,
    material,
    unlocked,
    setChapter,
    setQuery,
    toggleOpen,
    openRelation,
    setActiveCase,
    setMaterialId,
    unlockField,
    relockField,
    setTheme,
    toggleTheme,
  }
}
