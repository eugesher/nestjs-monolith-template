import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import {
  boundaries,
  e2e,
  libsDeepImports,
  plainNode,
  specs,
  style,
  typescript,
} from './lint/index.mjs';

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/*.config.js',
      'jest/*.js',
      '.lintstagedrc.js',
      '.yarn/**',
      'coverage/**',
      'dist/**',
    ],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  style,
  typescript,
  boundaries,
  specs,
  e2e,
  libsDeepImports,
  plainNode,
);
