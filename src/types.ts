export type Awaitable<T> = Promise<T> | T
export type Fn<A, B> = (v: A) => B

/**
 * A generic asynchronous or synchronous function that has
 * an input of type T and an optional output of type U
 */
export type Task<T, U> = Fn<T, Awaitable<U | null>>

/**
 * A Task whose both input and output are of type T
 */
export type EndoTask<T> = Task<T, T>
