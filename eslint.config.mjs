import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import { boundaries } from './lint/boundaries/index.mjs';
import { e2e } from './lint/e2e.mjs';
import { libsDeepImports } from './lint/libs-deep-imports.mjs';
import { plainNode } from './lint/plain-node.mjs';
import { specs } from './lint/specs.mjs';
import { style } from './lint/style.mjs';
import { typescript } from './lint/typescript.mjs';

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
