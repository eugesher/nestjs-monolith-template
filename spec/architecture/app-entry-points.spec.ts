import { readFileSync } from 'fs';
import * as path from 'path';

import '../support/lint';

describe('app entry points', () => {
  it('tsconfig publishes exactly these app entry points, no wildcards', () => {
    const tsconfig = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8'),
    ) as { compilerOptions: { paths: Record<string, string[]> } };

    const appAliases = Object.keys(tsconfig.compilerOptions.paths).filter(
      (alias) => alias.startsWith('@acme-admin') || alias.startsWith('@acme-client'),
    );

    expect(appAliases).toEqual(['@acme-admin-features', '@acme-client-features']);
  });

  it.each(['@acme-admin-features', '@acme-client-features'])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each([
    '@acme-admin-features/health/health.module',
    '@acme-client-features/health/health.module',
    '@acme-admin-features/index',
  ])('a deep path into an app does not resolve: %s', (source) => {
    expect(source).not.toResolve();
  });

  it.each([
    ['apps/admin-api/src/app/app.module.ts', '@acme-admin-features'],
    ['apps/client-api/src/app/app.module.ts', '@acme-client-features'],
  ])('%s MAY import the features of its own app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { HealthModule } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/admin-api/src/app/app.module.ts', '@acme-client-features'],
    ['apps/client-api/src/app/app.module.ts', '@acme-admin-features'],
  ])('%s may NOT import the features of the other app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { HealthModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/admin-api/src/features/health/presentation/controllers/__fixture__.ts',
    'apps/admin-api/src/main.ts',
  ])('%s may NOT import the features index, only the app root wires features', async (file) => {
    await expect({
      file,
      code: 'import { HealthModule } from "@acme-admin-features";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a feature root MAY import the health lib by its alias', async () => {
    await expect({
      file: 'apps/client-api/src/features/health/health.module.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toPassArchitectureLint();
  });

  it('a feature presentation MAY import the health lib contracts by their alias', async () => {
    await expect({
      file: 'apps/client-api/src/features/health/presentation/controllers/__fixture__.ts',
      code: 'import { HEALTH_LIB_PORT } from "@acme-libs/contracts/health";',
    }).toPassArchitectureLint();
  });

  it('a feature presentation may NOT import the health lib root', async () => {
    await expect({
      file: 'apps/client-api/src/features/health/presentation/controllers/__fixture__.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toBreakRule('boundaries/dependencies');
  });
});
