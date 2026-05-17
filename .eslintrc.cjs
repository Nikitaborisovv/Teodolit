/* ESLint 8 config — flat config will replace this if/when we upgrade to v9. */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react-refresh'],
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '*.cjs',
    'vite.config.ts',
    'postcss.config.js',
    'tailwind.config.ts',
  ],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['src/scene/**/*.{ts,tsx}', 'src/ui/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
      rules: {},
    },
    {
      files: ['src/geometry/**/*.ts', 'src/mechanics/**/*.ts'],
      rules: {
        // geometry/ and mechanics/ are framework-free — block three.js imports
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: 'three', message: 'geometry/ and mechanics/ must not import three.js' },
              { name: '@react-three/fiber', message: 'Pure math layers cannot use R3F' },
              { name: '@react-three/drei', message: 'Pure math layers cannot use drei' },
            ],
            patterns: ['three/*', '@react-three/*'],
          },
        ],
      },
    },
  ],
};
