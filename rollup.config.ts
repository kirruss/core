import typescript from "@wessberg/rollup-plugin-ts"
import _package from "./package.json"

import analyzer from "rollup-plugin-analyzer"
import { terser } from "rollup-plugin-terser"

const development = Boolean(process.env.ROLLUP_WATCH)

const inputFile = "src/index.ts"

export default [
    {
        input: inputFile,
        output: {
            file: _package.main,
            format: "cjs",
            sourcemap: true
        },
        plugins: [!development && terser(), typescript()]
    },
    {
        input: inputFile,
        output: {
            file: _package.module,
            format: "esm",
            sourcemap: true
        },
        plugins: [
            !development && terser(),
            typescript({
                tsconfig: resolvedConfig => ({
                    ...resolvedConfig,
                    declaration: true
                })
            }),
            analyzer({ summaryOnly: true })
        ]
    }
]
