export type And<T extends unknown[]> = {
    0: unknown
    1: T extends [infer head, ...infer tail]
        ? head & And<tail>
        : never
}[T extends [] ? 0 : 1]

export type Fn<A, B> = (v: A) => B

export type Inputs<T extends TaskArray> = And<
    {
        [P in keyof T]: T[P] extends Task<infer I, any>
            ? I
            : undefined
    }
>
export type Outputs<T extends TaskArray> = {
    [P in keyof T]: T[P] extends Task<any, infer O>
        ? O
        : undefined
}

export type TaskArray = Array<Task<any, any>>

/**
 * A value that can be awaited
 */
export type Awaitable<T> = Promise<T> | T

/**
 * A generic asynchronous or synchronous function that has
 * an input of type T and an optional output of type U
 */
export type Task<T, U> = Fn<T, Awaitable<U | null>>

/**
 * A Task whose both input and output are of type T
 */
export type EndoTask<T> = Task<T, T>
