const namedOnly =
  '/^(bull|@nestjs\\x2Fbull|@nestjs\\x2Fschedule|@nestjs\\x2Fcommon|@acme-libs\\x2Fauth|@acme-libs\\x2Fkernel)$/';

const message = 'a policy allows this module by name, so it is imported only by named specifiers';

export const namedImportSelectors = [
  `ImportDeclaration[source.value=${namedOnly}]:not(:has(ImportSpecifier))`,
  `ImportDeclaration[source.value=${namedOnly}]:has(ImportDefaultSpecifier)`,
  `ExportAllDeclaration[source.value=${namedOnly}]`,
  `ImportExpression[source.value=${namedOnly}]`,
].map((selector) => ({ selector, message }));
