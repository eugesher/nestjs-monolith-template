import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';

import '../support/lint';

describe('lib entry points', () => {
  it('libs/ holds exactly the libs the edge table in libs.spec.ts knows about', () => {
    const libs = readdirSync(path.resolve(__dirname, '../../libs')).sort();

    expect(libs).toEqual(['kernel', 'toolkit']);
  });

  it('tsconfig publishes exactly these lib entry points, no wildcards', () => {
    const tsconfig = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8'),
    ) as { compilerOptions: { paths: Record<string, string[]> } };

    const libAliases = Object.keys(tsconfig.compilerOptions.paths).filter((alias) =>
      alias.startsWith('@acme-libs/'),
    );

    expect(libAliases).toEqual(['@acme-libs/kernel', '@acme-libs/toolkit']);
  });

  it.each(['@acme-libs/kernel', '@acme-libs/toolkit'])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each([
    '@acme-libs/kernel/app/app-name.enum',
    '@acme-libs/toolkit/ddd/entity.base',
    '@acme-libs/toolkit/src',
  ])('a deep path into a lib does not resolve: %s', (source) => {
    expect(source).not.toResolve();
  });

  it.each([
    'apps/admin-api/src/features/item/domain/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/domain/__fixture__.ts',
  ])('%s MAY import the framework-free libs by their aliases', async (file) => {
    await expect({
      file,
      code: 'import { AppNameEnum } from "@acme-libs/kernel";\nimport { Entity } from "@acme-libs/toolkit";',
    }).toPassArchitectureLint();
  });

  it('entities MAY import the kernel lib by its alias', async () => {
    await expect({
      file: 'core/entities/src/__fixture__.ts',
      code: 'import { ItemStatusEnum } from "@acme-libs/kernel";',
    }).toPassArchitectureLint();
  });

  it('entities may NOT import the toolkit lib — a table is not a domain model', async () => {
    await expect({
      file: 'core/entities/src/__fixture__.ts',
      code: 'import { Entity } from "@acme-libs/toolkit";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the kernel lib may NOT import the toolkit lib by its alias', async () => {
    await expect({
      file: 'libs/kernel/src/auth/__fixture__.ts',
      code: 'import { Entity } from "@acme-libs/toolkit";',
    }).toBreakRule('boundaries/dependencies');
  });
});
