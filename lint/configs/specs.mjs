import { barrelBypassSelectors } from '../syntax/barrel-bypass.selectors.mjs';
import { namedImportSelectors } from '../syntax/named-imports.selectors.mjs';

export const specs = {
  files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'apps/*/test/**/*.ts', 'test/system/**/*.ts'],
  rules: {
    '@typescript-eslint/no-extraneous-class': [
      'error',
      { allowEmpty: true, allowStaticOnly: true, allowWithDecorator: true },
    ],
    'no-restricted-syntax': ['error', ...barrelBypassSelectors, ...namedImportSelectors],
  },
};
