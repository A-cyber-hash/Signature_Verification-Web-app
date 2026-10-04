module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  plugins: ['react'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/jsx-uses-vars': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'warn',
    'react/prop-types': 'off',
  },
  overrides: [
    {
      files: ['vite.config.js'],
      env: { node: true },
    },
  ],
};
