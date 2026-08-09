import type { Material, Theme } from '../types'
import { MaterialPanel } from './MaterialPanel'

type Props = {
  materialId: string
  material: Material | undefined
  overrideCount: number
  theme: Theme
  onMaterialChange: (id: string) => void
  onToggleTheme: () => void
}

export function Header({
  materialId,
  material,
  overrideCount,
  theme,
  onMaterialChange,
  onToggleTheme,
}: Props) {
  return (
    <header className="header">
      <div className="wrap">
        <div className="header-top">
          <div className="header-text">
            <h1>Strength of Materials</h1>
            <p className="header-sub">
              Pick a relation, enter your values, and get the result with the working shown.
            </p>
          </div>
          <button
            type="button"
            className="theme-btn"
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <MaterialPanel
          materialId={materialId}
          material={material}
          overrideCount={overrideCount}
          onChange={onMaterialChange}
        />

        <div style={{ height: '20px' }} />
      </div>
    </header>
  )
}
