import type { Task, Fn } from "./types"

export const filter = <T>(
    fn: Fn<T, boolean>
): Task<T, T> => async input => {
    if (fn(input)) return input

    return null
}
