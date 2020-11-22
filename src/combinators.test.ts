import * as C from "."

describe("combinators", () => {
    describe("never<T>(_: T): null", () => {
        it("always returns null", async () => {
            const task = C.never("foo")

            expect(task).toBeNull()
        })
    })
})
