import esbuild from 'esbuild';
import {
  commonConfig,
  browserConfig,
  serveConfig,
  serveOptions
} from './config.mjs';

await esbuild.serve(serveOptions, {
  ...commonConfig,
  ...serveConfig,
  ...browserConfig
});
