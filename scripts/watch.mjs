import esbuild from 'esbuild';
import {
  commonConfig,
  esmConfig,
  cjsConfig,
  browserConfig,
  watchConfig
} from './config.mjs';

/** @typedef {import('esbuild').BuildOptions} BuildOptions */

const config = { ...commonConfig, ...watchConfig };

await Promise.all([
  esbuild.build({ ...config, ...esmConfig }),
  esbuild.build({ ...config, ...cjsConfig }),
  esbuild.build({ ...config, ...browserConfig })
]);
