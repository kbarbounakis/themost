import rollupBabel from 'rollup-plugin-babel';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommon from 'rollup-plugin-commonjs';
import rollupSourceMaps from 'rollup-plugin-sourcemaps';
import autoExternal from 'rollup-plugin-auto-external';

const dist = './dist/';
const name = 'themost_web';
const production = !process.env.ROLLUP_WATCH;

module.exports = {
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
            name: '@themost/web',
            file: `${dist}${name}.js`,
            format: 'umd'
        }
    ],
    plugins: [
        rollupBabel(),
        rollupResolve(),
        rollupCommon(),
        autoExternal()
    ]
};
