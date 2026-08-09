type Props = {
  value: string
  onChange: (v: string) => void
}

export function SearchField({ value, onChange }: Props) {
  return (
    <div className="search">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search — try buckling, hoop stress, or twist"
        aria-label="Search relations"
      />
      {value.trim().length > 0 && (
        <button type="button" className="link-btn" onClick={() => onChange('')}>
          Clear
        </button>
      )}
    </div>
  )
}
