module.export = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  // env: {
  //   browser: true,
  //   node: true,
  // },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.base.json', './packages/*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint'],
  root: true,

  rules: {
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'prefer-promise-reject-errors': 'error',
  },
};
