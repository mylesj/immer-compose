import { RollupOptions } from 'rollup'
import typescript from '@rollup/plugin-typescript'

import pkg from './package.json'

const config: RollupOptions = {
    input: 'src/module.ts',
    output: [
        { file: pkg.main, format: 'cjs' },
        { file: pkg.module, format: 'es' },
    ],
    plugins: [typescript()],
    external: ['immer'],
    onwarn: (err) => {
        throw new Error(err.message)
    },
}

export default config
