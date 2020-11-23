import * as C from "."

describe("combinators", () => {
    describe("always<T, U>(v: U): Task<T, U>", () => {
        it("always returns the parameter v", async () => {
            const task = C.always("foo")

            expect(task("bar")).toBe("foo")
        })
    })
    describe("never<T>(_: T): null", () => {
        it("always returns null", () => {
            const task = C.never("foo")

            expect(task).toBeNull()
        })
    })
})
