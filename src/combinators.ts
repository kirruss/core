import type {
    Awaitable,
    EndoTask,
    Fn,
    Inputs,
    Outputs,
    Task,
    TaskArray
} from "./types"

/**
 * A helper that stops unconditionally.
 */
export const stop = () => null
/**
 * A helper that is an alias for the identity function.
 */
export const succeed = <T>(v: T) => v

/**
 * A combinator that is the equivalent of Promise#all. It
 * takes a list of tasks and returns a task that applies an
 * input to all tasks and returns the result. It will fail
 * if any of the tasks fail.
 *
 * @example
 * const task1 = async (x: number) => {
 *     await setTimeout(100)
 *     return x
 * }
 * const task2 = async (x: number) => {
 *     await setTimeout(500)
 *     return x * 2
 * }
 * const task3 = async (x: number) => {
 *     await setTimeout(300)
 *     return x + 1
 * }
 *
 * const task = all(task1, task2, task3)
 *
 * await task(3) // => [3, 6, 4] after 500ms
 *
 * @param tasks A list of tasks
 */
export const all = <T extends TaskArray>(
    ...tasks: readonly [...T]
): Task<Inputs<T>, Outputs<T>> => async input => {
    const results = await Promise.all(
        tasks.map(task => task(input))
    )

    if (results.includes(null)) return null

    return results as any
}

/**
 * A combinator that takes a constant value and returns
 * a task that unconditionally outputs the constant.
 *
 * @example
 * const task = always("foo")
 *
 * await task("bar") // => "foo"
 */
export const always = <T, U>(v: U): Task<T, U> => _ => v

/**
 * A combinator that takes a list of tasks and returns the
 * result of the first task to not stop when called with
 * the provided input.
 *
 * @example
 * const fail = choose<string, string>()
 * const task = choose(never, always("bar"))
 *
 * await fail("foo") // => null
 * await task("foo") // => "bar"
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
 * applying the first task on the input and then applying
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
 * A combinator that takes an effect and calls it with the
 * current task's argument and returns the argument.
 *
 * @example
 * type FooObject = { foo: number }
 *
 * const foo = { foo: 0 }
 * const task = discard((input: FooObject) => {
 *     input.foo++
 * })
 *
 * foo // => { foo: 0 }
 * await task(foo)
 * foo // => { foo: 1 }
 *
 * @param effect A function that has side effects
 * @param bubbleFailures A value (defaults to true) that
 * determines whether the task should fail when the effect
 * fails or just return the argument
 */
export const discard = <A, B>(
    effect: Task<A, B>,
    bubbleFailures = true
): EndoTask<A> => async argument => {
    const result = await effect(argument)
    if (result === null && bubbleFailures) return null

    return argument
}

/**
 * A combinator that takes a filter task and
 * returns a task that fails if the input doesn't satisfy
 * the filter tasks's predicate.
 *
 * @example
 * const task = filter((input: string) => input.length > 3)
 *
 * await task("foo") // => null
 * await task("foobar") // => "foobar"
 *
 * @param task A filter function that returns whether or not the input satisfies a predicate
 */
export const filter = <T>(
    task: Task<T, boolean>
): EndoTask<T> => async input => {
    if (await task(input)) return input

    return null
}

/**
 * A combinator that takes a constant value and returns
 * a task that unconditionally outputs `null` (fails).
 *
 * @example
 * const task = never("foo")
 *
 * task // => null
 *
 * @param _ A constant value
 */
export const never = <T>(_: T): null => stop()

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
 */
export const pack = <A, B>(
    task: Task<A, Task<A, B>>
): Task<A, B> => async argument => {
    const result = await task(argument)

    if (!result) return null

    return result(argument)
}

/**
 * A combinator that is the equivalent of Promise#race. It
 * takes a list of tasks and returns a task that applies an
 * input to all tasks and returns the result of the first
 * task to finish.
 *
 * @example
 * const task1 = async (x: number) => {
 *     await setTimeout(100)
 *     return x
 * }
 * const task2 = async (x: number) => {
 *     await setTimeout(500)
 *     return x * 2
 * }
 * const task3 = async (x: number) => {
 *     await setTimeout(300)
 *     return x + 1
 * }
 *
 * const task = race(task1, task2, task3)
 *
 * await task(3) // => 3 after 100ms
 *
 * @param tasks A list of tasks
 */
export const race = <T extends TaskArray>(
    ...tasks: readonly [...T]
): Task<Inputs<T>, Outputs<T>[number]> => async input => {
    const result = await Promise.race(
        tasks.map(task => task(input))
    )

    return result as any
}

/**
 * A combinator that takes a task and an input and returns
 * the result of applying that task on that input.
 *
 * @example
 * const task = reduce(always("foo"), "bar")
 *
 * await task // => "foo"
 *
 * @param fn A task
 * @param input An input value
 */
export const reduce = async <A, B>(
    fn: Task<A, B>,
    input: Awaitable<A | null>
): Promise<B | null> => {
    const result = await input
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
 */
export const warbler = <A, B>(
    task: Fn<A, Task<A, B>>
): Task<A, B> => argument => task(argument)(argument)
