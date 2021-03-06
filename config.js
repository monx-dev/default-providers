import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import filesize from 'rollup-plugin-filesize';
import json from '@rollup/plugin-json';

const defaultPluginConfig = {
  resolve: {},
  commonjs: {},
};

const plugins = (config = defaultPluginConfig) => {
  return [
    peerDepsExternal(),
    json(),
    resolve(config.resolve),
    commonjs(config.commonjs),

    typescript({
      useTsconfigDeclarationDir: true,
      typescript: require('ttypescript'),
      tsconfigDefaults: {
        compilerOptions: {
          plugins: [
            { transform: 'typescript-transform-paths' },
            { transform: 'typescript-transform-paths', afterDeclarations: true },
          ],
        },
      },
    }),

    babel({
      presets: ['@babel/preset-typescript', '@babel/preset-react'],
      exclude: 'node_modules/**',
      extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
      babelHelpers: 'bundled',
    }),
    terser(),
    filesize(),
  ];
};

export default (config) => {
  const EXTERNAL = Object.keys({ ...config.peerDependencies, ...config.dependencies });
  const output = {
    format: config.format || 'cjs',
    dir: 'dist',
    globals: config.globals,
  };

  if (config.format === 'umd' && !config.input.map) {
    output.name = config.input;
  }

  return config.format === 'umd' && config.input.map
    ? config.input.map((file) => ({
        input: file,
        output: {
          ...output,
          name: file,
        },
        plugins: plugins(config.plugins),
        external: EXTERNAL,
      }))
    : {
        input: config.input,
        output,
        plugins: plugins(config.plugins),
        external: EXTERNAL,
      };
};
