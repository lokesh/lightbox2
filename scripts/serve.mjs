import esbuild from 'esbuild';
import {
  commonConfig,
  esmConfig,
  cjsConfig,
  browserConfig,
  serveConfig,
  serveOptions
} from './config.mjs';

const config = { ...commonConfig, ...serveConfig };

await Promise.all([
  esbuild.serve(serveOptions, { ...config, ...esmConfig }),
  esbuild.serve(serveOptions, { ...config, ...cjsConfig }),
  esbuild.serve(serveOptions, { ...config, ...browserConfig })
]);
