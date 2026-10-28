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

    expect(appAliases).toEqual([
      '@acme-admin-app',
      '@acme-admin-features',
      '@acme-client-app',
      '@acme-client-common/modules/idempotency',
      '@acme-client-common/shared/concurrency',
      '@acme-client-common/shared/idempotency',
      '@acme-client-contracts/idempotency',
      '@acme-client-contracts/ledger-catalog-events',
      '@acme-client-features',
      '@acme-client-processors',
    ]);
  });

  it.each([
    '@acme-admin-app',
    '@acme-admin-features',
    '@acme-client-app',
    '@acme-client-common/modules/idempotency',
    '@acme-client-common/shared/concurrency',
    '@acme-client-common/shared/idempotency',
    '@acme-client-contracts/idempotency',
    '@acme-client-contracts/ledger-catalog-events',
    '@acme-client-features',
    '@acme-client-processors',
  ])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each([
    '@acme-admin-app/setup/config/config-setup.module',
    '@acme-client-app/app.module',
    '@acme-admin-features/health/health.module',
    '@acme-client-features/health/health.module',
    '@acme-admin-features/index',
    '@acme-client-common/modules/idempotency/application',
    '@acme-client-common/shared/concurrency/decorators/if-match.decorator',
    '@acme-client-common/shared/idempotency/helpers/idempotency-key.helper',
    '@acme-client-contracts/idempotency/ports/idempotency-common.port',
    '@acme-client-contracts/ledger-catalog-events/events/ledger-catalog-events.event',
    '@acme-client-processors/ledger-catalog-events/ledger-catalog-events.module',
    '@acme-client-processors/index',
  ])('a deep path into an app does not resolve: %s', (source) => {
    expect(source).not.toResolve();
  });

  it.each([
    ['apps/admin-api/src/main.ts', '@acme-admin-app'],
    ['apps/client-api/src/main.ts', '@acme-client-app'],
    ['apps/admin-api/test/context/__fixture__.ts', '@acme-admin-app'],
    ['apps/client-api/test/context/__fixture__.ts', '@acme-client-app'],
  ])('%s MAY import the AppModule of its own app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/admin-api/src/main.ts', '@acme-client-app'],
    ['apps/client-api/src/main.ts', '@acme-admin-app'],
    ['apps/admin-api/test/context/__fixture__.ts', '@acme-client-app'],
  ])('%s may NOT import the AppModule of the other app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    ['apps/admin-api/src/app/setup/orm/__fixture__.ts', '@acme-admin-app'],
    ['apps/admin-api/src/app/global/auth/module/__fixture__.ts', '@acme-admin-app'],
    ['apps/client-api/src/features/item/item.module.ts', '@acme-client-app'],
    ['apps/client-api/src/processors/idempotency-purge/__fixture__.ts', '@acme-client-app'],
    ['apps/client-api/src/common/shared/concurrency/__fixture__.ts', '@acme-client-app'],
  ])('%s may NOT import the AppModule, only main and the tests do', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it('the AppModule MAY register global providers with tokens from @nestjs/core', async () => {
    await expect({
      file: 'apps/admin-api/src/app/app.module.ts',
      code: 'import { APP_FILTER, APP_PIPE } from "@nestjs/core";',
    }).toPassArchitectureLint();
  });

  it('the app setup may NOT import @nestjs/core, only the AppModule registers global providers', async () => {
    await expect({
      file: 'apps/admin-api/src/app/setup/orm/__fixture__.ts',
      code: 'import { APP_PIPE } from "@nestjs/core";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('main may NOT reach past the AppModule into the app setup', async () => {
    await expect({
      file: 'apps/admin-api/src/main.ts',
      code: 'import { ConfigSetupModule } from "./app/setup/config/config-setup.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('main MAY take the Nest logger from nestjs-pino', async () => {
    await expect({
      file: 'apps/client-api/src/main.ts',
      code: 'import { Logger } from "nestjs-pino";',
    }).toPassArchitectureLint();
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

  it('apps/client-api/src/app/app.module.ts MAY import the processors of its own app by @acme-client-processors', async () => {
    await expect({
      file: 'apps/client-api/src/app/app.module.ts',
      code: 'import { LedgerCatalogEventsModule } from "@acme-client-processors";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/admin-api/src/app/app.module.ts',
    'apps/client-api/src/features/item/item.module.ts',
    'apps/client-api/src/main.ts',
  ])('%s may NOT import the client-api processors index', async (file) => {
    await expect({
      file,
      code: 'import { LedgerCatalogEventsModule } from "@acme-client-processors";',
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

  it('a client-api feature root MAY mount the idempotency common module by its alias', async () => {
    await expect({
      file: 'apps/client-api/src/features/health/health.module.ts',
      code: 'import { IdempotencyCommonModule } from "@acme-client-common/modules/idempotency";',
    }).toPassArchitectureLint();
  });

  it('a client-api feature presentation MAY import the shared decorators by their aliases', async () => {
    await expect({
      file: 'apps/client-api/src/features/health/presentation/controllers/__fixture__.ts',
      code:
        'import { IfMatch } from "@acme-client-common/shared/concurrency";\n' +
        'import { IdempotencyKey } from "@acme-client-common/shared/idempotency";',
    }).toPassArchitectureLint();
  });

  it('a client-api processor consumer MAY import the ledger catalog events contract by its alias', async () => {
    await expect({
      file: 'apps/client-api/src/processors/ledger-catalog-events/presentation/ledger-catalog-events.consumer.ts',
      code: 'import { LEDGER_CATALOG_EVENTS } from "@acme-client-contracts/ledger-catalog-events";',
    }).toPassArchitectureLint();
  });

  it('a client-api feature common-adapter MAY import the idempotency contracts by their alias', async () => {
    await expect({
      file: 'apps/client-api/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { IDEMPOTENCY_COMMON_PORT } from "@acme-client-contracts/idempotency";',
    }).toPassArchitectureLint();
  });

  it.each([
    [
      'apps/client-api/src/features/health/application/__fixture__.ts',
      '@acme-client-contracts/idempotency',
    ],
    [
      'apps/client-api/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      '@acme-client-common/modules/idempotency',
    ],
  ])('%s may NOT import %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });

  it.each([
    [
      'apps/admin-api/src/features/health/health.module.ts',
      '@acme-client-common/modules/idempotency',
    ],
    [
      'apps/admin-api/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      '@acme-client-contracts/idempotency',
    ],
    [
      'apps/admin-api/src/features/health/presentation/controllers/__fixture__.ts',
      '@acme-client-common/shared/concurrency',
    ],
  ])('admin-api (%s) may NOT reach the client-api %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });
});
