import '../support/lint';

describe('lib layers', () => {
  it.each([
    ['shell', 'application', '../application'],
    ['shell', 'infrastructure', '../infrastructure'],
    ['application', 'outbound', '../outbound'],
    ['infrastructure', 'outbound', '../outbound'],
    ['outbound', 'outbound', '../outbound'],
  ])('the %s of a lib MAY reach its %s', async (from, _, source) => {
    await expect({
      file: `libs/cache/src/${from}/__fixture__.ts`,
      code: `import { x } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['shell', 'outbound', '../outbound'],
    ['application', 'shell', '../shell/cache-lib.module'],
    ['application', 'infrastructure', '../infrastructure'],
    ['infrastructure', 'shell', '../shell/cache-lib.module'],
    ['infrastructure', 'application', '../application'],
    ['outbound', 'shell', '../shell/cache-lib.module'],
    ['outbound', 'application', '../application'],
    ['outbound', 'infrastructure', '../infrastructure'],
  ])('the %s of a lib may NOT reach its %s', async (from, _, source) => {
    await expect({
      file: `libs/cache/src/${from}/__fixture__.ts`,
      code: `import { x } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it('the layers of a lib part follow the same rules', async () => {
    await expect({
      file: 'libs/local-storage/src/transaction/application/__fixture__.ts',
      code: 'import { x } from "../infrastructure";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    ['libs/database/src/orm/shell/__fixture__.ts', '../../naming/snake-naming.strategy'],
    ['libs/database/src/orm/application/__fixture__.ts', '../../repository/hosted.repository'],
  ])('%s MAY reach the part of its lib it is built on', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toPassArchitectureLint();
  });

  it('a shell spec MAY reach the outbound tokens it overrides', async () => {
    await expect({
      file: 'libs/cache/src/shell/spec/__fixture__.spec.ts',
      code: 'import { x } from "../../outbound";',
    }).toPassArchitectureLint();
  });
});
