import '../support/lint';

describe('modules allowed by name', () => {
  describe.each([
    'bull',
    '@nestjs/bull',
    '@nestjs/schedule',
    '@nestjs/common',
    '@acme-libs/auth',
    '@acme-libs/kernel',
  ])('%s', (source) => {
    it.each([
      ['a namespace import', `import * as x from "${source}";`],
      ['a default import', `import x from "${source}";`],
      ['a side-effect import', `import "${source}";`],
      ['a star export', `export * from "${source}";`],
      ['a dynamic import', `export const x = import("${source}");`],
    ])('may NOT be taken by %s', async (_, code) => {
      await expect({
        file: 'apps/processor-app/src/processors/ledger/presentation/__fixture__.ts',
        code,
      }).toBreakRule('no-restricted-syntax');
    });
  });
});
