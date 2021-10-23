module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'arrow-spacing': ['error', {'before': true, 'after': true}],
    'callback-return': ['error', ['callback', 'cb', 'next', 'done', 'proceed']],
    'camelcase': ['error', {'properties': 'always'}],
    'comma-dangle': ['error', 'never'],
    'comma-style': ['error', 'last'],
    'curly': ['error'],
    'eol-last': ['error'],
    'eqeqeq': ['error', 'always'],
    'handle-callback-err': ['error'],
    'indent': ['error', 2, {'SwitchCase': 1}],
    'linebreak-style': ['error', 'unix'],
    'no-const-assign': ['error'],
    'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
    'no-return-assign': ['error', 'always'],
    'no-sequences': ['error'],
    'no-trailing-spaces': ['error'],
    'no-undef': ['error'],
    'no-unexpected-multiline': ['error'],
    'no-unused-vars': ['error'],
    'no-var': ['error'],
    'one-var': ['error', 'never'],
    'prefer-const': ['error'],
    'rest-spread-spacing': ['error', 'never'],
    'semi': ['error', 'always']
  },
  overrides: [
    {
      files: [
        'eslintrc.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'ember-cli-build.js',
        'index.js',
        'server/**/*.js',
        'testem.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon-test-support/**',
        'addon/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        'camelcase': ['off'],
        'no-var': ['off']
      })
    }
  ]
};
