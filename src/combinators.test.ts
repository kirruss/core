import * as C from "."

describe("combinators", () => {
    describe("never<T>(_: T): Promise<null>", () => {
        it("always returns null", async () => {
            const task = C.never("foo")

            expect(await task).toBeNull()
        })
    })
})
