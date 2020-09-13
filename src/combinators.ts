import type { Task, Fn } from "./types"

export const filter = <T>(
    fn: Fn<T, boolean>
): Task<T, T> => async input => {
    if (fn(input)) return input

    return null
}

export const reduce = async <A, B>(
    fn: Task<A, B>,
    promise: Promise<A | null>
): Promise<B | null> => {
    const result = await promise
    if (!result) return null

    return fn(result)
}
