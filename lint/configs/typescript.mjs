import { join } from 'path';
import typescriptEslint from 'typescript-eslint';

import { awaitedArgumentSelectors } from '../syntax/awaited-argument.selectors.mjs';
import { barrelBypassSelectors } from '../syntax/barrel-bypass.selectors.mjs';

export const typescript = {
  files: ['**/*.ts'],
  extends: [
    ...typescriptEslint.configs.recommendedTypeChecked,
    ...typescriptEslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: join(import.meta.dirname, '../..'),
    },
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { overrides: { constructors: 'off' } },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: true },
      },
      {
        selector: 'enum',
        format: ['PascalCase'],
        custom: { regex: '[A-Za-z]Enum$', match: true },
      },
    ],
    '@typescript-eslint/promise-function-async': ['error', { checkArrowFunctions: false }],
    '@typescript-eslint/return-await': ['error', 'always'],
    'no-restricted-syntax': ['error', ...barrelBypassSelectors, ...awaitedArgumentSelectors],
  },
};
