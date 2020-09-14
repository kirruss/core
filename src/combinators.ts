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

/**
 * A combinator that takes a list of tasks and returns a
 * task that iterates over the list until a task is found
 * that doesn't fail with the provided input.
 *
 * @example
 * const fail = choose<string, string>()
 * const task = choose(never, always("bar"))
 *
 * await fail("foo") // => null
 * await task("foo") // => "bar"
 *
 * @param tasks A list of tasks
 * @returns A task that returns the result of the first
 * successful task application
 */
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

/**
 * A combinator that effectively glues together two tasks,
 *  applying the first task on the input and then applying
 * the second task on the result.
 *
 * @example
 * const firstTask = async (input: number) => String(input)
 * const secondTask = async (input: string) => input.length > 3
 * const composedTask = compose(firstTask, secondTask)
 *
 * await composedTask(42) // => false
 * await composedTask(8765) // => true
 *
 * @param first First task to get run
 * @param second Second task to get run
 * @returns A task that represents the gluing together of the two tasks
 */
export const compose = <A, B, C>(
    first: Task<A, B>,
    second: Task<B, C>
): Task<A, C> => input => reduce(second, first(input))

/**
 * A combinator that takes a task and an error handler and
 * tries running the task, deferring to the handler in case
 * of panic.
 *
 * @example
 * type ArrayOfFoo = {
 *     foo: number
 * }[]
 *
 * const arrayOne = [{ foo: 0 }, { foo: 1 }, { foo: 2 }]
 * const arrayTwo = [{ foo: 0 }, { foo: 1 }]
 * const task = async (input: ArrayOfFoo) =>
 *     console.log(input[2].foo)
 * const handler = async (_: unknown) =>
 *     console.error("Panic!")
 *
 * const catcher = catchErrors(task, handler)
 *
 * await catcher(arrayOne) // => 2
 * await catcher(arrayTwo) // => "Panic!"
 *
 * @param task A task
 * @param handler An error handler
 * @returns A task that defers to the handler on panic
 */
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

/**
 * A combinator that takes an effect that mutates the
 * current task's argument and returns the mutated argument.
 *
 * @example
 * type FooObject = { foo: number }
 *
 * const foo = { foo: 0 }
 * const task = effectful((input: FooObject) => {
 *     input.foo++
 * })
 *
 * foo // => { foo: 0 }
 * await task(foo)
 * foo // => { foo: 1 }
 *
 * @param effect A function that has side effects
 * @returns A task that returns the mutated result
 */
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

/**
 * A combinator that takes a task that outputs another
 * inner task that will be called with the argument passed
 * onto the current task. The result of the call will be
 * returned.
 *
 * @example
 * const task = pack(async input => {
 *     return input ? always("foo") : never
 * })
 *
 * await task(true) // => "foo"
 * await task(false) // => null
 *
 * @param task A task that outputs another task
 * @returns A task that returns the result of applying the inner task
 */
export const pack = <A, B>(
    task: Task<A, Task<A, B>>
): Task<A, B> => async argument => {
    const result = await task(argument)

    if (!result) return null

    return result(argument)
}

/**
 * A combinator that takes a task and a promise and returns
 * the result of applying that task on that promise.
 *
 * @example
 * const task = reduce(always("foo"), Promise.resolve("bar"))
 *
 * await task // => "foo"
 *
 * @param fn A task
 * @param promise A promise
 * @returns The result of applying the task on the promise
 */
export const reduce = async <A, B>(
    fn: Task<A, B>,
    promise: Promise<A | null>
): Promise<B | null> => {
    const result = await promise
    if (!result) return null

    return fn(result)
}

/**
 * A choose combinator that is specifically typed for exactly two tasks.
 */
export const tryThen: <A, B>(
    first: Task<A, B>,
    second: Task<A, B>
) => Task<A, B> = choose

/**
 * A combinator that takes a task and returns another one
 * that tries to apply the initial task on the input,
 * returning the input unchanged on failure.
 *
 * @example
 * const fail = tryTo(never)
 * const task = tryTo(always("foo"))
 *
 * await fail("bar") // => "bar"
 * await task("bar") // => "foo"
 *
 * @param task A task
 * @returns A task that either returns the result of calling the task with the argument or the initial argument
 */
export const tryTo = <A>(
    task: EndoTask<A>
): EndoTask<A> => async argument => {
    const result = await task(argument)

    if (!result) return argument
    return result
}

/**
 * A pack combinator in a synchronous form.
 *
 * @example
 * const task = warbler(input => {
 *     return input ? always("foo") : never
 * })
 *
 * await task(true) // => "foo"
 * await task(false) // => null
 *
 * @param task A function that outputs a task
 * @returns A task that returns the result of applying the inner task
 */
export const warbler = <A, B>(
    task: Fn<A, Task<A, B>>
): Task<A, B> => argument => task(argument)(argument)
