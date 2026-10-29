import boundariesPlugin from 'eslint-plugin-boundaries';
import { join } from 'path';

import { categories } from './categories/index.mjs';
import { policies } from './policies/index.mjs';

const root = join(import.meta.dirname, '../..');

export const boundaries = {
  files: ['**/*.ts'],
  plugins: { boundaries: boundariesPlugin },
  settings: {
    'import/resolver': { typescript: { project: join(root, 'tsconfig.json') } },
    'boundaries/root-path': root,
    'boundaries/dependency-nodes': ['import', 'export', 'dynamic-import'],
    'boundaries/legacy-templates': false,
    'boundaries/files': categories,
    'boundaries/files-single-match': true,
  },
  rules: {
    'boundaries/no-unknown-files': 'error',
    'boundaries/no-unknown-dependencies': 'error',
    'boundaries/dependencies': [
      'error',
      { default: 'disallow', checkAllOrigins: true, checkUnknownLocals: true, policies },
    ],
  },
};
