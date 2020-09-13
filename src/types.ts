export type Fn<A, B> = (v: A) => B
export type Task<T, U> = Fn<T, Promise<U | null>>
