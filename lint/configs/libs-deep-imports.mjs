const message =
  "outside specs a lib is imported by its root; the only deep entry points allowed are a lib's contracts (@acme-libs/contracts/<lib>) and @acme-libs/observability/tracer (the test helpers of @acme-libs/testing are for *.spec.ts and the e2e code only)";

export const libsDeepImports = {
  files: ['apps/**/*.ts', 'core/**/*.ts', 'libs/**/*.ts'],
  ignores: [
    '**/*.spec.ts',
    '**/*.e2e-spec.ts',
    'apps/*/test/**/*.ts',
    'test/system/**/*.ts',
    'libs/testing/**/*.ts',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '@acme-libs/*/**',
              '!@acme-libs/*/**/',
              '!@acme-libs/contracts/*',
              '!@acme-libs/observability/tracer',
            ],
            message,
          },
          {
            group: ['@acme-core/entities/**'],
            message: 'outside specs the entities are imported by their root, @acme-core/entities',
          },
          {
            group: ['@acme-*/common/entities/**'],
            message:
              'outside specs the entities of an app are imported by their root, @acme-<app>/common/entities',
          },
        ],
      },
    ],
  },
};
