module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    // 'eslint:recommended',
    // 'plugin:@typescript-eslint/recommended',
    // 'plugin:react/recommended',
    // 'plugin:react/jsx-runtime',
    // 'plugin:react-hooks/recommended',
    // 'plugin:prettier/recommended',
    // //'plugin:typescript-sort-keys/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.base.json', './packages/**/tsconfig.json', './apps/**/tsconfig.json'],
  },
  plugins: ['@typescript-eslint' /*, 'typescript-sort-keys'*/],
  root: true,
  rules: {
    // Disable all rules (optional)
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/jsx-key': 'off',
    'prefer-promise-reject-errors': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
