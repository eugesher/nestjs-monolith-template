import { readFileSync } from 'fs';
import * as path from 'path';

import '../support/lint';

describe('app entry points', () => {
  it('tsconfig publishes exactly these app entry points, no wildcards', () => {
    const tsconfig = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8'),
    ) as { compilerOptions: { paths: Record<string, string[]> } };

    const appAliases = Object.keys(tsconfig.compilerOptions.paths).filter(
      (alias) => alias.startsWith('@acme-staff') || alias.startsWith('@acme-customer'),
    );

    expect(appAliases).toEqual([
      '@acme-staff-app',
      '@acme-staff-features',
      '@acme-customer-app',
      '@acme-customer-common/modules/idempotency',
      '@acme-customer-common/shared/concurrency',
      '@acme-customer-common/shared/idempotency',
      '@acme-customer-contracts/idempotency',
      '@acme-customer-contracts/ledger-catalog-events',
      '@acme-customer-features',
      '@acme-customer-processors',
    ]);
  });

  it.each([
    '@acme-staff-app',
    '@acme-staff-features',
    '@acme-customer-app',
    '@acme-customer-common/modules/idempotency',
    '@acme-customer-common/shared/concurrency',
    '@acme-customer-common/shared/idempotency',
    '@acme-customer-contracts/idempotency',
    '@acme-customer-contracts/ledger-catalog-events',
    '@acme-customer-features',
    '@acme-customer-processors',
  ])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each([
    '@acme-staff-app/setup/config/config-setup.module',
    '@acme-customer-app/app.module',
    '@acme-staff-features/health/health.module',
    '@acme-customer-features/health/health.module',
    '@acme-staff-features/index',
    '@acme-customer-common/modules/idempotency/application',
    '@acme-customer-common/shared/concurrency/decorators/if-match.decorator',
    '@acme-customer-common/shared/idempotency/helpers/idempotency-key.helper',
    '@acme-customer-contracts/idempotency/ports/idempotency-common.port',
    '@acme-customer-contracts/ledger-catalog-events/events/ledger-catalog-events.event',
    '@acme-customer-processors/ledger-catalog-events/ledger-catalog-events.module',
    '@acme-customer-processors/index',
  ])('a deep path into an app does not resolve: %s', (source) => {
    expect(source).not.toResolve();
  });

  it.each([
    ['apps/staff-app/src/main.ts', '@acme-staff-app'],
    ['apps/customer-app/src/main.ts', '@acme-customer-app'],
    ['apps/staff-app/test/context/__fixture__.ts', '@acme-staff-app'],
    ['apps/customer-app/test/context/__fixture__.ts', '@acme-customer-app'],
  ])('%s MAY import the AppModule of its own app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/staff-app/src/main.ts', '@acme-customer-app'],
    ['apps/customer-app/src/main.ts', '@acme-staff-app'],
    ['apps/staff-app/test/context/__fixture__.ts', '@acme-customer-app'],
  ])('%s may NOT import the AppModule of the other app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    ['apps/staff-app/src/app/setup/orm/__fixture__.ts', '@acme-staff-app'],
    ['apps/staff-app/src/app/global/auth/module/__fixture__.ts', '@acme-staff-app'],
    ['apps/customer-app/src/features/item/item.module.ts', '@acme-customer-app'],
    ['apps/customer-app/src/processors/idempotency-purge/__fixture__.ts', '@acme-customer-app'],
    ['apps/customer-app/src/common/shared/concurrency/__fixture__.ts', '@acme-customer-app'],
  ])('%s may NOT import the AppModule, only main and the tests do', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it('the AppModule MAY register global providers with tokens from @nestjs/core', async () => {
    await expect({
      file: 'apps/staff-app/src/app/app.module.ts',
      code: 'import { APP_FILTER, APP_PIPE } from "@nestjs/core";',
    }).toPassArchitectureLint();
  });

  it('the app setup may NOT import @nestjs/core, only the AppModule registers global providers', async () => {
    await expect({
      file: 'apps/staff-app/src/app/setup/orm/__fixture__.ts',
      code: 'import { APP_PIPE } from "@nestjs/core";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('main may NOT reach past the AppModule into the app setup', async () => {
    await expect({
      file: 'apps/staff-app/src/main.ts',
      code: 'import { ConfigSetupModule } from "./app/setup/config/config-setup.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('main MAY take the Nest logger from nestjs-pino', async () => {
    await expect({
      file: 'apps/customer-app/src/main.ts',
      code: 'import { Logger } from "nestjs-pino";',
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/staff-app/src/app/app.module.ts', '@acme-staff-features'],
    ['apps/customer-app/src/app/app.module.ts', '@acme-customer-features'],
  ])('%s MAY import the features of its own app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { HealthModule } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/staff-app/src/app/app.module.ts', '@acme-customer-features'],
    ['apps/customer-app/src/app/app.module.ts', '@acme-staff-features'],
  ])('%s may NOT import the features of the other app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { HealthModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it('apps/customer-app/src/app/app.module.ts MAY import the processors of its own app by @acme-customer-processors', async () => {
    await expect({
      file: 'apps/customer-app/src/app/app.module.ts',
      code: 'import { LedgerCatalogEventsModule } from "@acme-customer-processors";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/app/app.module.ts',
    'apps/customer-app/src/features/item/item.module.ts',
    'apps/customer-app/src/main.ts',
  ])('%s may NOT import the customer-app processors index', async (file) => {
    await expect({
      file,
      code: 'import { LedgerCatalogEventsModule } from "@acme-customer-processors";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/staff-app/src/features/health/presentation/controllers/__fixture__.ts',
    'apps/staff-app/src/main.ts',
  ])('%s may NOT import the features index, only the app root wires features', async (file) => {
    await expect({
      file,
      code: 'import { HealthModule } from "@acme-staff-features";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a feature root MAY import the health lib by its alias', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/health.module.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toPassArchitectureLint();
  });

  it('a feature presentation MAY import the health lib contracts by their alias', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/presentation/controllers/__fixture__.ts',
      code: 'import { HEALTH_LIB_PORT } from "@acme-libs/contracts/health";',
    }).toPassArchitectureLint();
  });

  it('a feature presentation may NOT import the health lib root', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/presentation/controllers/__fixture__.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a customer-app feature root MAY mount the idempotency common module by its alias', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/health.module.ts',
      code: 'import { IdempotencyCommonModule } from "@acme-customer-common/modules/idempotency";',
    }).toPassArchitectureLint();
  });

  it('a customer-app feature presentation MAY import the shared decorators by their aliases', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/presentation/controllers/__fixture__.ts',
      code:
        'import { IfMatch } from "@acme-customer-common/shared/concurrency";\n' +
        'import { IdempotencyKey } from "@acme-customer-common/shared/idempotency";',
    }).toPassArchitectureLint();
  });

  it('a customer-app processor consumer MAY import the ledger catalog events contract by its alias', async () => {
    await expect({
      file: 'apps/customer-app/src/processors/ledger-catalog-events/presentation/ledger-catalog-events.consumer.ts',
      code: 'import { LEDGER_CATALOG_EVENTS } from "@acme-customer-contracts/ledger-catalog-events";',
    }).toPassArchitectureLint();
  });

  it('a customer-app feature common-adapter MAY import the idempotency contracts by their alias', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { IDEMPOTENCY_COMMON_PORT } from "@acme-customer-contracts/idempotency";',
    }).toPassArchitectureLint();
  });

  it.each([
    [
      'apps/customer-app/src/features/health/application/__fixture__.ts',
      '@acme-customer-contracts/idempotency',
    ],
    [
      'apps/customer-app/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      '@acme-customer-common/modules/idempotency',
    ],
  ])('%s may NOT import %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });

  it.each([
    [
      'apps/staff-app/src/features/health/health.module.ts',
      '@acme-customer-common/modules/idempotency',
    ],
    [
      'apps/staff-app/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      '@acme-customer-contracts/idempotency',
    ],
    [
      'apps/staff-app/src/features/health/presentation/controllers/__fixture__.ts',
      '@acme-customer-common/shared/concurrency',
    ],
  ])('staff-app (%s) may NOT reach the customer-app %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });
});
