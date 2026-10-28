import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import { boundaries } from './eslint/boundaries/index.mjs';
import { libsDeepImports } from './eslint/libs-deep-imports.mjs';
import { specs } from './eslint/specs.mjs';
import { style } from './eslint/style.mjs';
import { typescript } from './eslint/typescript.mjs';

export default defineConfig(
  { ignores: ['**/node_modules/**', '**/*.config.js', '.yarn/**', 'coverage/**', 'dist/**'] },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  style,
  typescript,
  boundaries,
  specs,
  libsDeepImports,
);
