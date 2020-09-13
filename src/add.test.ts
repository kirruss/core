import { add } from "./add"

describe("add(x: number, y: number): number", () => {
    it("add(3, 5) => 8", () => expect(add(3, 5)).toBe(8))
    it("add(3, -5) => -2", () =>
        expect(add(3, -5)).toBe(-2))
    it("add(3, 5 / 2) => 5.5", () =>
        expect(add(3, 5 / 2)).toBe(5.5))
    it("add(3, NaN) => NaN", () =>
        expect(add(3, Number.NaN)).toBe(Number.NaN))
})
