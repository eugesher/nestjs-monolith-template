import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import {
  boundaries,
  classes,
  e2e,
  exports,
  imports,
  libsDeepImports,
  modules,
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
  classes,
  specs,
  e2e,
  exports,
  imports,
  libsDeepImports,
  modules,
  plainNode,
);
