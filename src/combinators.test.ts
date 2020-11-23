import * as C from "."

describe("combinators", () => {
    describe("always<T, U>(v: U): Task<T, U>", () => {
        it("returns the parameter v", async () => {
            const task = C.always("foo")

            expect(await task("bar")).toBe("foo")
        })
    })
    describe("choose<I, O>(Array<Task<I, O>>): Task<I, O>", () => {
        it("returns never if there are no tasks", async () => {
            const fail = C.choose<string, string>()

            expect(await fail("foo")).toBeNull()
        })
        it("returns the matching task", async () => {
            const task = C.choose(C.never, C.always("bar"))

            expect(await task("foo")).toBe("bar")
        })
    })
    describe("never<T>(_: T): null", () => {
        it("returns null", () => {
            const task = C.never("foo")

            expect(task).toBeNull()
        })
    })
})
