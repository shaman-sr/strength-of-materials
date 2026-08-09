import { useCallback, useEffect, useRef, useState } from 'react'
import { save } from '../lib/storage'

const WRITE_DELAY_MS = 300

/**
 * State that mirrors itself into storage.
 *
 * Writes are debounced: typing into a field fires a state update per keystroke,
 * and serialising the whole store that often is wasted work. The pending write
 * is also flushed on unmount and on `pagehide`, so closing the tab mid-typing
 * does not lose the last few characters.
 */
export function usePersistentState<T>(
  key: string,
  initial: () => T,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial)

  // What the debounced write should persist. Seeded from the initial value and
  // updated inside `set`, which is the only path by which `value` can change —
  // so it stays current without being touched during render.
  const latest = useRef(value)

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirty = useRef(false)

  const flush = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
    if (!dirty.current) return
    dirty.current = false
    save(key, latest.current)
  }, [key])

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
        latest.current = next
        return next
      })
      dirty.current = true
      if (timer.current !== null) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = null
        if (!dirty.current) return
        dirty.current = false
        save(key, latest.current)
      }, WRITE_DELAY_MS)
    },
    [key],
  )

  useEffect(() => {
    // pagehide fires on tab close and on bfcache navigation, where an unmount
    // cleanup alone would not run.
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [flush])

  return [value, set]
}
