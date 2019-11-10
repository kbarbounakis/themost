import rollupBabel from 'rollup-plugin-babel';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommon from 'rollup-plugin-commonjs';
// import rollupSourceMaps from 'rollup-plugin-sourcemaps';
import autoExternal from 'rollup-plugin-auto-external';
import dts from "rollup-plugin-dts";

const dist = './dist/';
const name = 'themost_query';

module.exports = [{
    input: './src/index.js',
    output: [
        {
            file: `${dist}${name}.cjs.js`,
            format: 'cjs'
        },
        {
            file: `${dist}${name}.esm.js`,
            format: 'esm'
        },
        {
            name: '@themost/query',
            file: `${dist}${name}.js`,
            format: 'umd'
        }
    ],
    plugins: [
        rollupBabel({
            exclude: "node_modules/**",
            runtimeHelpers: true
        }),
        rollupResolve(),
        rollupCommon(),
        autoExternal()
    ]
}, {
    input: './src/index.d.ts',
    output: [ { file: `${dist}${name}.d.ts`, format: "es" } ],
    plugins: [dts()],
  }];
