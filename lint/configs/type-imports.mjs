import { typeImportsInDecoratedFiles } from '../rules/type-imports-in-decorated-files.rule.mjs';

export const typeImports = {
  files: ['**/*.ts'],
  plugins: { acme: { rules: { 'type-imports-in-decorated-files': typeImportsInDecoratedFiles } } },
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    'acme/type-imports-in-decorated-files': 'error',
  },
};
