import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/', '.next/', 'coverage/', 'next-env.d.ts'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,jsx,mjs}'],
    plugins: { 'react-hooks': reactHooks, '@next/next': nextPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  { files: ['**/*.config.js'], languageOptions: { sourceType: 'commonjs' } },
  prettier,
];
