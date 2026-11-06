import { readFileSync } from 'fs';
import * as path from 'path';

import '../support/lint';

describe('app entry points', () => {
  it('tsconfig publishes exactly these app aliases', () => {
    const tsconfig = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8'),
    ) as { compilerOptions: { paths: Record<string, string[]> } };

    const appAliases = Object.keys(tsconfig.compilerOptions.paths).filter(
      (alias) =>
        alias.startsWith('@acme-staff') ||
        alias.startsWith('@acme-customer') ||
        alias.startsWith('@acme-processor'),
    );

    expect(appAliases).toEqual([
      '@acme-customer/app',
      '@acme-customer/app/*',
      '@acme-customer/common',
      '@acme-customer/common/*',
      '@acme-customer/features',
      '@acme-customer/features/*',
      '@acme-processor/app',
      '@acme-processor/app/*',
      '@acme-processor/common',
      '@acme-processor/common/*',
      '@acme-processor/features',
      '@acme-processor/features/*',
      '@acme-processor/processors',
      '@acme-processor/processors/*',
      '@acme-staff/app',
      '@acme-staff/app/*',
      '@acme-staff/common',
      '@acme-staff/common/*',
      '@acme-staff/contracts',
      '@acme-staff/contracts/*',
      '@acme-staff/features',
      '@acme-staff/features/*',
    ]);
  });

  it.each([
    '@acme-staff/app/app.module',
    '@acme-staff/common/shared/concurrency',
    '@acme-staff/common/shared/ledger-record',
    '@acme-staff/features',
    '@acme-customer/app/app.module',
    '@acme-customer/common/shared/ledger-record',
    '@acme-customer/features',
    '@acme-processor/app/app.module',
    '@acme-processor/common/shared/ledger-record',
    '@acme-processor/features',
    '@acme-processor/processors',
  ])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each(['@acme-staff/processors'])('%s does not resolve', (source) => {
    expect(source).not.toResolve();
  });

  it.each([
    ['apps/staff-app/src/app/app.module.ts', '@acme-staff/features/health/health.module'],
    ['apps/customer-app/src/app/app.module.ts', '@acme-customer/features/health/health.module'],
    ['apps/processor-app/src/app/app.module.ts', '@acme-processor/processors/ledger/ledger.module'],
    [
      'apps/staff-app/src/features/product/__fixture__.ts',
      '@acme-staff/app/setup/config/config-setup.module',
    ],
    [
      'apps/staff-app/src/features/product/__fixture__.ts',
      '@acme-staff/common/shared/concurrency/decorators/if-match.decorator',
    ],
    [
      'apps/staff-app/src/features/product/__fixture__.ts',
      '@acme-staff/common/shared/ledger-record/queues/ledger-record-queue.module',
    ],
    [
      'apps/customer-app/src/features/order/__fixture__.ts',
      '@acme-customer/common/shared/ledger-record/queues/ledger-record-queue.module',
    ],
  ])('%s may NOT reach a deep path through an alias: %s', async (file, source) => {
    await expect({
      file,
      code: `import { X } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    ['apps/staff-app/src/main.ts', '@acme-staff/app/app.module'],
    ['apps/customer-app/src/main.ts', '@acme-customer/app/app.module'],
    ['apps/processor-app/src/main.ts', '@acme-processor/app/app.module'],
    ['apps/staff-app/test/context/__fixture__.ts', '@acme-staff/app/app.module'],
    ['apps/customer-app/test/context/__fixture__.ts', '@acme-customer/app/app.module'],
    ['apps/processor-app/test/context/__fixture__.ts', '@acme-processor/app/app.module'],
  ])('%s MAY import the AppModule of its own app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/staff-app/src/main.ts', '@acme-customer/app/app.module'],
    ['apps/customer-app/src/main.ts', '@acme-staff/app/app.module'],
    ['apps/staff-app/test/context/__fixture__.ts', '@acme-customer/app/app.module'],
    ['apps/processor-app/src/main.ts', '@acme-staff/app/app.module'],
    ['apps/processor-app/test/context/__fixture__.ts', '@acme-customer/app/app.module'],
  ])('%s may NOT import the AppModule of the other app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { AppModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    ['apps/staff-app/src/app/setup/orm/__fixture__.ts', '@acme-staff/app/app.module'],
    ['apps/staff-app/src/app/global/auth/shell/__fixture__.ts', '@acme-staff/app/app.module'],
    ['apps/staff-app/src/features/product/product.module.ts', '@acme-staff/app/app.module'],
    [
      'apps/processor-app/src/processors/idempotency/__fixture__.ts',
      '@acme-processor/app/app.module',
    ],
    ['apps/staff-app/src/common/shared/concurrency/__fixture__.ts', '@acme-staff/app/app.module'],
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
    ['apps/staff-app/src/app/app.module.ts', '@acme-staff/features'],
    ['apps/customer-app/src/app/app.module.ts', '@acme-customer/features'],
    ['apps/processor-app/src/app/app.module.ts', '@acme-processor/features'],
  ])('%s MAY import the features of its own app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { HealthModule } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/staff-app/src/app/app.module.ts', '@acme-customer/features'],
    ['apps/customer-app/src/app/app.module.ts', '@acme-staff/features'],
    ['apps/processor-app/src/app/app.module.ts', '@acme-staff/features'],
  ])('%s may NOT import the features of the other app by %s', async (file, source) => {
    await expect({
      file,
      code: `import { HealthModule } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it('apps/processor-app/src/app/app.module.ts MAY import the processors of its own app by @acme-processor/processors', async () => {
    await expect({
      file: 'apps/processor-app/src/app/app.module.ts',
      code: 'import { LedgerModule } from "@acme-processor/processors";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/app/app.module.ts',
    'apps/customer-app/src/app/app.module.ts',
    'apps/processor-app/src/features/health/health.module.ts',
    'apps/processor-app/src/main.ts',
  ])('%s may NOT import the processor-app processors index', async (file) => {
    await expect({
      file,
      code: 'import { LedgerModule } from "@acme-processor/processors";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/staff-app/src/features/health/presentation/controllers/__fixture__.ts',
    'apps/staff-app/src/main.ts',
  ])('%s may NOT import the features index, only the app root wires features', async (file) => {
    await expect({
      file,
      code: 'import { HealthModule } from "@acme-staff/features";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a feature root MAY import the health lib by its alias', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/health.module.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toPassArchitectureLint();
  });

  it('a feature lib adapter MAY import the health lib contracts by their alias', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/infrastructure/lib-adapters/__fixture__.ts',
      code: 'import { HEALTH_LIB_PORT } from "@acme-libs/contracts/health";',
    }).toPassArchitectureLint();
  });

  it('a feature presentation may NOT import the health lib contracts', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/presentation/controllers/__fixture__.ts',
      code: 'import { HEALTH_LIB_PORT } from "@acme-libs/contracts/health";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a feature presentation may NOT import the health lib root', async () => {
    await expect({
      file: 'apps/customer-app/src/features/health/presentation/controllers/__fixture__.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/staff-app/src/features/health/health.module.ts',
    'apps/customer-app/src/features/health/health.module.ts',
    'apps/processor-app/src/processors/idempotency/idempotency.module.ts',
  ])('%s MAY mount the idempotency core module by its alias', async (file) => {
    await expect({
      file,
      code: 'import { IdempotencyCoreModule } from "@acme-core/modules/idempotency";',
    }).toPassArchitectureLint();
  });

  it('a staff-app feature presentation MAY import the shared decorators by their aliases', async () => {
    await expect({
      file: 'apps/staff-app/src/features/health/presentation/controllers/__fixture__.ts',
      code:
        'import { IfMatch } from "@acme-staff/common/shared/concurrency";\n' +
        'import { IdempotencyKey } from "@acme-libs/http";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/processor-app/src/processors/ledger/presentation/ledger-append.processor.ts',
    'apps/staff-app/src/features/product/infrastructure/queue/product-ledger-record-queue.adapter.ts',
    'apps/staff-app/src/common/shared/ledger-record/queues/ledger-record-queue.module.ts',
    'apps/staff-app/test/context/app-e2e.context.ts',
    'apps/customer-app/src/features/auth/infrastructure/queue/auth-ledger-record-queue.adapter.ts',
    'apps/customer-app/src/common/shared/ledger-record/queues/ledger-record-queue.module.ts',
    'apps/customer-app/test/context/app-e2e.context.ts',
  ])('%s MAY import the ledger record contract of the core ledger', async (file) => {
    await expect({
      file,
      code: 'import { LEDGER_RECORD_QUEUE } from "@acme-core/contracts/ledger";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/processor-app/src/features/queue/infrastructure/queue/queue-registry-queue.adapter.ts',
    'apps/processor-app/src/common/shared/product-stock-post-subtract/queues/product-stock-post-subtract-queue.module.ts',
  ])('%s MAY import the queue contract of the core product stock', async (file) => {
    await expect({
      file,
      code: 'import { PRODUCT_STOCK_POST_SUBTRACT_QUEUE } from "@acme-core/contracts/product-stock";',
    }).toPassArchitectureLint();
  });

  it.each([
    [
      'apps/processor-app/src/processors/ledger/ledger.module.ts',
      '@acme-processor/common/shared/ledger-record',
    ],
    [
      'apps/staff-app/src/features/product/product.module.ts',
      '@acme-staff/common/shared/ledger-record',
    ],
    [
      'apps/customer-app/src/features/auth/auth.module.ts',
      '@acme-customer/common/shared/ledger-record',
    ],
  ])('%s MAY register the ledger record queue by %s', async (file, source) => {
    await expect({
      file,
      code: `import { LedgerRecordQueueModule } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/features/health/infrastructure/core-adapters/__fixture__.ts',
    'apps/customer-app/src/features/health/infrastructure/core-adapters/__fixture__.ts',
    'apps/processor-app/src/processors/idempotency/infrastructure/core-adapters/__fixture__.ts',
  ])('%s MAY import the idempotency core contracts by their alias', async (file) => {
    await expect({
      file,
      code: 'import { IDEMPOTENCY_CORE_KEY_PORT } from "@acme-core/contracts/idempotency";',
    }).toPassArchitectureLint();
  });

  it.each([
    [
      'apps/staff-app/src/features/health/application/__fixture__.ts',
      '@acme-core/contracts/idempotency',
    ],
    [
      'apps/staff-app/src/features/health/infrastructure/core-adapters/__fixture__.ts',
      '@acme-core/modules/idempotency',
    ],
    [
      'apps/staff-app/src/features/product/infrastructure/queue/__fixture__.ts',
      '@acme-staff/common/shared/ledger-record',
    ],
  ])('%s may NOT import %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });

  it.each([
    [
      'apps/customer-app/src/features/health/health.module.ts',
      '@acme-staff/common/shared/concurrency',
    ],
    [
      'apps/customer-app/src/features/health/presentation/controllers/__fixture__.ts',
      '@acme-staff/common/shared/concurrency',
    ],
    ['apps/customer-app/src/app/app.module.ts', '@acme-staff/common/shared/ledger-record'],
    [
      'apps/customer-app/src/features/auth/auth.module.ts',
      '@acme-staff/common/shared/ledger-record',
    ],
  ])('customer-app (%s) may NOT reach the staff-app %s', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });
});
