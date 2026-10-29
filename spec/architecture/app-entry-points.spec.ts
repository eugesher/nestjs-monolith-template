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
      '@acme-staff-common/modules/idempotency',
      '@acme-staff-common/shared/concurrency',
      '@acme-staff-common/shared/idempotency',
      '@acme-staff-common/shared/ledger-record',
      '@acme-staff-contracts/idempotency',
      '@acme-staff-contracts/ledger-record',
      '@acme-staff-features',
      '@acme-staff-processors',
      '@acme-customer-app',
      '@acme-customer-features',
    ]);
  });

  it.each([
    '@acme-staff-app',
    '@acme-staff-common/modules/idempotency',
    '@acme-staff-common/shared/concurrency',
    '@acme-staff-common/shared/idempotency',
    '@acme-staff-common/shared/ledger-record',
    '@acme-staff-contracts/idempotency',
    '@acme-staff-contracts/ledger-record',
    '@acme-staff-features',
    '@acme-staff-processors',
    '@acme-customer-app',
    '@acme-customer-features',
  ])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each([
    '@acme-staff-app/setup/config/config-setup.module',
    '@acme-customer-app/app.module',
    '@acme-staff-features/health/health.module',
    '@acme-customer-features/health/health.module',
    '@acme-staff-features/index',
    '@acme-staff-common/modules/idempotency/application',
    '@acme-staff-common/shared/concurrency/decorators/if-match.decorator',
    '@acme-staff-common/shared/idempotency/helpers/idempotency-key.helper',
    '@acme-staff-contracts/idempotency/ports/idempotency-common.port',
    '@acme-staff-common/shared/ledger-record/queues/ledger-record-queue.module',
    '@acme-staff-contracts/ledger-record/queues/ledger-record.queue',
    '@acme-staff-processors/ledger-record/ledger-record.module',
    '@acme-staff-processors/index',
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
    ['apps/staff-app/src/features/product/product.module.ts', '@acme-staff-app'],
    ['apps/staff-app/src/processors/idempotency-purge/__fixture__.ts', '@acme-staff-app'],
    ['apps/staff-app/src/common/shared/concurrency/__fixture__.ts', '@acme-staff-app'],
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

  it('apps/staff-app/src/app/app.module.ts MAY import the processors of its own app by @acme-staff-processors', async () => {
    await expect({
      file: 'apps/staff-app/src/app/app.module.ts',
      code: 'import { LedgerRecordModule } from "@acme-staff-processors";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/customer-app/src/app/app.module.ts',
    'apps/staff-app/src/features/product/product.module.ts',
    'apps/staff-app/src/main.ts',
  ])('%s may NOT import the staff-app processors index', async (file) => {
    await expect({
      file,
      code: 'import { LedgerRecordModule } from "@acme-staff-processors";',
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

  it('a staff-app feature root MAY mount the idempotency common module by its alias', async () => {
    await expect({
      file: 'apps/staff-app/src/features/health/health.module.ts',
      code: 'import { IdempotencyCommonModule } from "@acme-staff-common/modules/idempotency";',
    }).toPassArchitectureLint();
  });

  it('a staff-app feature presentation MAY import the shared decorators by their aliases', async () => {
    await expect({
      file: 'apps/staff-app/src/features/health/presentation/controllers/__fixture__.ts',
      code:
        'import { IfMatch } from "@acme-staff-common/shared/concurrency";\n' +
        'import { IdempotencyKey } from "@acme-staff-common/shared/idempotency";',
    }).toPassArchitectureLint();
  });

  it('a staff-app processor consumer MAY import the ledger record contract by its alias', async () => {
    await expect({
      file: 'apps/staff-app/src/processors/ledger-record/presentation/ledger-record.consumer.ts',
      code: 'import { LEDGER_RECORD_QUEUE } from "@acme-staff-contracts/ledger-record";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/processors/ledger-record/ledger-record.module.ts',
    'apps/staff-app/src/features/product/product.module.ts',
  ])('%s MAY register the ledger record queue by its alias', async (file) => {
    await expect({
      file,
      code: 'import { LedgerRecordQueueModule } from "@acme-staff-common/shared/ledger-record";',
    }).toPassArchitectureLint();
  });

  it('a staff-app feature common-adapter MAY import the idempotency contracts by their alias', async () => {
    await expect({
      file: 'apps/staff-app/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { IDEMPOTENCY_COMMON_PORT } from "@acme-staff-contracts/idempotency";',
    }).toPassArchitectureLint();
  });

  it.each([
    [
      'apps/staff-app/src/features/health/application/__fixture__.ts',
      '@acme-staff-contracts/idempotency',
    ],
    [
      'apps/staff-app/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      '@acme-staff-common/modules/idempotency',
    ],
    [
      'apps/staff-app/src/features/product/infrastructure/queue/__fixture__.ts',
      '@acme-staff-common/shared/ledger-record',
    ],
  ])('%s may NOT import %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });

  it.each([
    [
      'apps/customer-app/src/features/health/health.module.ts',
      '@acme-staff-common/modules/idempotency',
    ],
    [
      'apps/customer-app/src/features/health/infrastructure/common-adapters/__fixture__.ts',
      '@acme-staff-contracts/idempotency',
    ],
    [
      'apps/customer-app/src/features/health/presentation/controllers/__fixture__.ts',
      '@acme-staff-common/shared/concurrency',
    ],
    ['apps/customer-app/src/app/app.module.ts', '@acme-staff-common/shared/ledger-record'],
  ])('customer-app (%s) may NOT reach the staff-app %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });
});
