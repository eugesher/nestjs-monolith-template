import { barrelBypassSelectors } from '../syntax/barrel-bypass.selectors.mjs';
import { namedImportSelectors } from '../syntax/named-imports.selectors.mjs';

export const specs = {
  files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'apps/*/test/**/*.ts'],
  rules: {
    'no-restricted-syntax': ['error', ...barrelBypassSelectors, ...namedImportSelectors],
  },
};
