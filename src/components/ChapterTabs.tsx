import type { Chapter } from '../types'

type Props = {
  chapters: Chapter[]
  active: string
  /** While a search is running no tab is current — results span chapters. */
  searching: boolean
  onSelect: (key: string) => void
}

export function ChapterTabs({ chapters, active, searching, onSelect }: Props) {
  return (
    <nav className="tabs" aria-label="Topics">
      {chapters.map((c) => {
        const on = !searching && active === c.key
        return (
          <button
            key={c.key}
            className={`tab${on ? ' tab-on' : ''}`}
            aria-current={on ? 'true' : undefined}
            onClick={() => onSelect(c.key)}
          >
            {c.tab}
          </button>
        )
      })}
    </nav>
  )
}
