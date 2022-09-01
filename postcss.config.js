import { resolve } from 'node:path';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import url from 'postcss-url';

export default {
  plugins: [
    autoprefixer(),
    url({
      url: 'copy',
      basePath: resolve('src', 'images'),
      assetsPath: '../images',
      useHash: false
    }),
    cssnano()
  ]
};
