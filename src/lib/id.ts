let counter = 0

/**
 * A unique id for a stored record.
 *
 * The counter matters: saving twice inside the same millisecond is easy to do
 * with a keyboard, and two records sharing an id would make React reuse rows
 * and delete the wrong one.
 */
export const newId = (): string => `${Date.now().toString(36)}-${(counter++).toString(36)}`
