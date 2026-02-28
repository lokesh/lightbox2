module.exports = [
  {
    files: ['src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        Image: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        parseInt: 'readonly',
        // Module systems (UMD wrapper)
        define: 'readonly',
        module: 'writable',
        exports: 'writable',
        require: 'readonly',
        // jQuery
        $: 'readonly',
        jQuery: 'readonly'
      }
    },
    rules: {
      // From .jshintrc
      'curly': 'error',
      'eqeqeq': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-empty': 'error',
      'no-new': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['error', { vars: 'all', args: 'none', caughtErrors: 'none' }],
      'new-cap': 'error',
      'guard-for-in': 'error',
      'max-depth': ['error', 6],
      'max-params': ['error', 6],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'no-trailing-spaces': 'error',

      // From .jscsrc
      'keyword-spacing': 'error',
      'space-before-blocks': 'error',
      'wrap-iife': ['error', 'any'],
      'one-var': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-mixed-spaces-and-tabs': 'error',
      'comma-style': ['error', 'last'],
      'space-infix-ops': 'error',
      'space-unary-ops': ['error', { words: true, nonwords: false }],
      'comma-dangle': ['error', 'never'],
      'eol-last': 'error',
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'spaced-comment': ['error', 'always', { markers: ['!'] }]
    }
  }
];
