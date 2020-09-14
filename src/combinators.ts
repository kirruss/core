import type { EndoTask, Fn, Task } from "./types"
import { fail } from "./utils"

/**
 * A combinator that takes a constant value `v` and returns
 * a task that unconditionally outputs `v`.
 *
 * @example
 * const task = always("foo")
 *
 * await task("bar") // => "foo"
 *
 * @param v A constant value
 * @returns A task that always outputs `v`
 */
export const always = <T, U>(v: U): Task<T, U> => _ =>
    Promise.resolve(v)

export const choose = <I, O>(
    ...tasks: Array<Task<I, O>>
): Task<I, O> =>
    tasks.length === 0
        ? never
        : async input => {
              const [head, ...tail] = tasks

              const result = await head(input)

              if (!result) return choose(...tail)(input)

              return result
          }

export const compose = <A, B, C>(
    first: Task<A, B>,
    second: Task<B, C>
): Task<A, C> => input => reduce(second, first(input))

export const catchErrors = <A, B, E>(
    task: Task<A, B>,
    handler: Task<E, B>
): Task<A, B> => async input => {
    try {
        return await task(input)
    } catch (error: unknown) {
        return handler(error as E)
    }
}

export const effectful = <A>(
    effect: Fn<A, Promise<void> | void>
): EndoTask<A> => async argument => {
    await effect(argument)

    return argument
}

/**
 * A combinator that takes a filter function `fn` and
 * returns a task that fails if the input doesn't satisfy
 * `fn`'s predicate.
 *
 * @example
 * const task = filter((input: string) => input.length > 3)
 *
 * await task("foo") // => null
 * await task("foobar") // => "foobar"
 *
 * @param fn A filter function that returns whether or not the input satisfies a predicate
 * @returns A task that fails if the input doesn't satisfy the predicate
 */
export const filter = <T>(
    fn: Fn<T, boolean>
): EndoTask<T> => async input => {
    if (fn(input)) return input

    return null
}

/**
 * A combinator that takes a constant value and returns
 * a task that unconditionally outputs `null` (fails).
 *
 * @example
 * const task = never("foo")
 *
 * await task // => null
 *
 * @param _ A constant value
 * @returns A task that always fails
 */
export const never = <T>(_: T): Promise<null> => fail()

export const pack = <A, B>(
    task: Task<A, Task<A, B>>
): Task<A, B> => async argument => {
    const result = await task(argument)

    if (!result) return null

    return result(argument)
}

export const reduce = async <A, B>(
    fn: Task<A, B>,
    promise: Promise<A | null>
): Promise<B | null> => {
    const result = await promise
    if (!result) return null

    return fn(result)
}

export const tryThen: <A, B>(
    first: Task<A, B>,
    second: Task<A, B>
) => Task<A, B> = choose

export const tryTo = <A>(
    task: EndoTask<A>
): EndoTask<A> => async argument => {
    const result = await task(argument)

    if (!result) return argument
    return result
}

export const warbler = <A, B>(
    task: Fn<A, Task<A, B>>
): Task<A, B> => argument => task(argument)(argument)
