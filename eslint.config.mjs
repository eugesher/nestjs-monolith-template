import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import typescriptEslint from 'typescript-eslint';

const barrelBypass =
  '/^\\.\\.?\\x2F(.*\\x2F)?(domain|outbound|application|infrastructure|presentation)\\x2F(?![\\w-]+\\.consumer$)./';

const barrelBypassMessage = "cross-layer imports go through the target layer's barrel (index.ts)";

const barrelSelectors = [
  'ImportDeclaration',
  'ExportAllDeclaration',
  'ExportNamedDeclaration',
  'ImportExpression',
].map((node) => ({
  selector: `${node}[source.value=${barrelBypass}]`,
  message: barrelBypassMessage,
}));

const awaitedArgumentMessage =
  'put the awaited result into a const before passing it to another call';

const awaitedArgumentSelectors = [
  {
    selector: ':matches(CallExpression, NewExpression) > AwaitExpression.arguments',
    message: awaitedArgumentMessage,
  },
  {
    selector:
      ':matches(CallExpression, NewExpression) > CallExpression.arguments > MemberExpression.callee > AwaitExpression.object',
    message: awaitedArgumentMessage,
  },
];

export default defineConfig(
  {
    ignores: ['**/node_modules/**', '**/*.config.js', '.yarn/**', 'coverage/**', 'dist/**'],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'no-console': 'error',
      'max-len': ['error', 150, { ignoreStrings: true, ignoreTemplateLiterals: true }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      ...typescriptEslint.configs.recommendedTypeChecked,
      ...typescriptEslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
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
      'no-restricted-syntax': ['error', ...barrelSelectors, ...awaitedArgumentSelectors],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...barrelSelectors],
    },
  },
);
