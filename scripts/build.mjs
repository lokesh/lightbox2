import esbuild from 'esbuild';
import {
  commonConfig,
  esmConfig,
  cjsConfig,
  browserConfig,
  buildConfig
} from './config.mjs';

const config = { ...commonConfig, ...buildConfig };

const results = await Promise.allSettled([
  esbuild.build({ ...config, ...esmConfig }),
  esbuild.build({ ...config, ...cjsConfig }),
  esbuild.build({ ...config, ...browserConfig })
]);

/** @type {unknown[]} */
const errors = [];

for (const result of results) {
  if (result.status === 'rejected') {
    errors.push(result.reason);
  } else if (result.value.errors.length > 0) {
    errors.push(...result.value.errors);
  }
}

if (errors.length > 0) {
  throw new AggregateError(errors, 'esbuild error.');
}
