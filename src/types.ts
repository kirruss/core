export type Fn<A, B> = (v: A) => B

/**
 * A generic asynchronous function that has an input of type
 * T and an optional output of type U
 */
export type Task<T, U> = Fn<T, Promise<U | null>>

/**
 * A Task whose both input and output are of type T
 */
export type EndoTask<T> = Task<T, T>
