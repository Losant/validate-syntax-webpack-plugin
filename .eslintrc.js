module.exports = {
  extends: '@losant/losant/env/node',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'only-multiline',
    }],
  },
};
