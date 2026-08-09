import type { ReactNode } from 'react'

/* Symbols are written in the data with an underscore for a subscript — σ_x,
   τ_max, σ_h,max — because that is the only way to put one in a plain string.
   On screen an underscore is just noise between two letters, so it is turned
   into a real subscript here. The data stays readable to edit; the reader gets
   σₓ rather than sigma-underscore-x. */

/* Built fresh per call rather than held at module scope: a /g regex carries a
   mutable lastIndex, and one shared between renders would skip matches. */
const subscriptPattern = () => /_([A-Za-z0-9]+(?:,[A-Za-z0-9]+)*)/g

/** Render a string containing `x_sub` notation with real subscripts. */
export function MathText({ children }: { children: string }) {
  const parts: ReactNode[] = []
  let last = 0

  for (const m of children.matchAll(subscriptPattern())) {
    const at = m.index
    if (at > last) parts.push(children.slice(last, at))
    parts.push(<sub key={`${at}-${m[1]}`}>{m[1]}</sub>)
    last = at + m[0].length
  }
  if (last < children.length) parts.push(children.slice(last))

  return <>{parts}</>
}
