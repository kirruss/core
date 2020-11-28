import * as C from "."

describe("combinators", () => {
    describe("always<T, U>(v: U): Task<T, U>", () => {
        it("returns the parameter v", async () => {
            const task = C.always("foo")

            expect(await task("bar")).toBe("foo")
        })
    })
    describe("choose<I, O>(...tasks: Array<Task<I, O>>): Task<I, O>", () => {
        it("returns null if there are no tasks", async () => {
            const fail = C.choose<string, string>()

            expect(await fail("foo")).toBeNull()
        })
        it("returns the matching task", async () => {
            const task = C.choose(C.never, C.always("bar"))

            expect(await task("foo")).toBe("bar")
        })
    })
    describe("compose<A, B, C>(first: Task<A, B>, second: Task<B, C>): Task<A, C>", () => {
        it("returns the result of piping the input through both functions in order", async () => {
            const firstTask = async (input: number) =>
                String(input)
            const secondTask = async (input: string) =>
                input.length > 3
            const composedTask = C.compose(
                firstTask,
                secondTask
            )

            expect(await composedTask(42)).toBe(false)
            expect(await composedTask(8762)).toBe(true)
        })
    })
    describe("never<T>(_: T): null", () => {
        it("returns null", () => {
            const task = C.never("foo")

            expect(task).toBeNull()
        })
    })
})
