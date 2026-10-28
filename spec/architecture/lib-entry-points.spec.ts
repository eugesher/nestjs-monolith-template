import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';

import '../support/lint';

describe('lib entry points', () => {
  it('libs/ holds exactly the libs the edge table in libs.spec.ts knows about', () => {
    const libs = readdirSync(path.resolve(__dirname, '../../libs')).sort();

    expect(libs).toEqual([
      'cache',
      'config',
      'contracts',
      'database',
      'health',
      'http',
      'kernel',
      'messaging',
      'observability',
      'openapi',
      'toolkit',
    ]);
  });

  it('tsconfig publishes exactly these lib entry points, no wildcards', () => {
    const tsconfig = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8'),
    ) as { compilerOptions: { paths: Record<string, string[]> } };

    const libAliases = Object.keys(tsconfig.compilerOptions.paths).filter((alias) =>
      alias.startsWith('@acme-libs/'),
    );

    expect(libAliases).toEqual([
      '@acme-libs/cache',
      '@acme-libs/cache/testing',
      '@acme-libs/config',
      '@acme-libs/contracts/cache',
      '@acme-libs/contracts/database',
      '@acme-libs/contracts/health',
      '@acme-libs/contracts/messaging',
      '@acme-libs/database',
      '@acme-libs/health',
      '@acme-libs/http',
      '@acme-libs/kernel',
      '@acme-libs/messaging',
      '@acme-libs/observability',
      '@acme-libs/observability/testing',
      '@acme-libs/observability/tracer',
      '@acme-libs/openapi',
      '@acme-libs/toolkit',
    ]);
  });

  it.each([
    '@acme-libs/cache',
    '@acme-libs/cache/testing',
    '@acme-libs/config',
    '@acme-libs/contracts/cache',
    '@acme-libs/contracts/database',
    '@acme-libs/contracts/health',
    '@acme-libs/contracts/messaging',
    '@acme-libs/database',
    '@acme-libs/health',
    '@acme-libs/http',
    '@acme-libs/kernel',
    '@acme-libs/messaging',
    '@acme-libs/openapi',
    '@acme-libs/toolkit',
  ])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each([
    '@acme-libs/kernel/app/app-name.enum',
    '@acme-libs/toolkit/ddd/entity.base',
    '@acme-libs/toolkit/src',
    '@acme-libs/config/env/env.helper',
    '@acme-libs/observability/correlation/correlation.middleware',
    '@acme-libs/contracts/database/ports/transaction.port',
    '@acme-libs/cache/redis/redis-cache.adapter',
    '@acme-libs/contracts/cache/ports/cache.port',
    '@acme-libs/database/transaction/transaction.adapter',
    '@acme-libs/messaging/publisher/in-process-event-publisher.adapter',
    '@acme-libs/contracts/messaging/ports/event-publisher.port',
    '@acme-libs/http/filters/http-exception.filter',
    '@acme-libs/openapi/api-reference/api-reference',
    '@acme-libs/health/module/health-lib.module',
    '@acme-libs/contracts/health/ports/health-lib.port',
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

  it.each([
    'apps/admin-api/src/features/item/application/use-cases/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
    'apps/admin-api/src/common/shared/auth/__fixture__.ts',
  ])('%s may NOT import test helpers outside specs', async (file) => {
    await expect({
      file,
      code: 'import { makePinoLoggerMock } from "@acme-libs/observability/testing";',
    }).toBreakRule('no-restricted-imports');
  });

  it.each([
    'apps/admin-api/src/features/item/application/use-cases/spec/__fixture__.spec.ts',
    'core/modules/src/__ledger-fixture__/application/spec/__fixture__.spec.ts',
    'apps/admin-api/test/app/__fixture__.e2e-spec.ts',
  ])('the spec %s MAY import test helpers', async (file) => {
    await expect({
      file,
      code: 'import { makePinoLoggerMock } from "@acme-libs/observability/testing";',
    }).toPassArchitectureLint();
  });

  it.each(['apps/admin-api/src/main.ts', 'apps/client-api/src/main.ts'])(
    '%s MAY import the allowlisted deep entry point tracer',
    async (file) => {
      await expect({
        file,
        code: 'import "@acme-libs/observability/tracer";',
      }).toPassArchitectureLint();
    },
  );

  it.each([
    'apps/admin-api/src/app/setup/orm/__fixture__.ts',
    'apps/admin-api/src/features/item/application/use-cases/__fixture__.ts',
    'apps/client-api/src/processors/purge/application/services/__fixture__.ts',
    'apps/client-api/src/common/modules/idempotency/application/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
  ])('%s MAY import the transaction port by its alias', async (file) => {
    await expect({
      file,
      code: 'import { TRANSACTION_PORT } from "@acme-libs/contracts/database";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/admin-api/src/features/item/domain/__fixture__.ts',
    'apps/admin-api/src/features/item/outbound/__fixture__.ts',
    'apps/admin-api/src/features/item/presentation/controllers/__fixture__.ts',
  ])(
    '%s may NOT import the transaction port by its alias, transactions are run by the application',
    async (file) => {
      await expect({
        file,
        code: 'import { TRANSACTION_PORT } from "@acme-libs/contracts/database";',
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it('the app root MAY import the database lib by its alias', async () => {
    await expect({
      file: 'apps/admin-api/src/app/setup/orm/__fixture__.ts',
      code: 'import { SnakeNamingStrategy } from "@acme-libs/database";',
    }).toPassArchitectureLint();
  });

  it('application may NOT import the database lib root, it takes the transaction port', async () => {
    await expect({
      file: 'apps/admin-api/src/features/item/application/use-cases/__fixture__.ts',
      code: 'import { TransactionAdapter } from "@acme-libs/database";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/admin-api/src/common/shared/auth/__fixture__.ts',
    'apps/client-api/src/features/reminder/infrastructure/cache/__fixture__.ts',
  ])('%s MAY import the cache contracts by their alias', async (file) => {
    await expect({
      file,
      code: 'import { CACHE_KEYS, CACHE_PORT } from "@acme-libs/contracts/cache";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/client-api/src/features/reminder/application/use-cases/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
  ])(
    '%s may NOT import the cache contracts by their alias, the application reads through its own port',
    async (file) => {
      await expect({
        file,
        code: 'import { CACHE_PORT } from "@acme-libs/contracts/cache";',
      }).toBreakRule('boundaries/dependencies');
    },
  );
  it('the app root MAY import the cache lib by its alias', async () => {
    await expect({
      file: 'apps/admin-api/src/app/app.module.ts',
      code: 'import { CacheModule } from "@acme-libs/cache";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/client-api/src/features/reminder/infrastructure/cache/__fixture__.ts',
    'apps/client-api/src/common/shared/auth/__fixture__.ts',
  ])('%s may NOT import the cache lib root, only the app root wires it', async (file) => {
    await expect({
      file,
      code: 'import { CacheModule } from "@acme-libs/cache";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the Redis client token may NOT be imported outside specs', async () => {
    await expect({
      file: 'apps/admin-api/src/app/__fixture__.ts',
      code: 'import { REDIS_CLIENT } from "@acme-libs/cache/testing";',
    }).toBreakRule('no-restricted-imports');
  });

  it('an e2e spec MAY take the Redis client token', async () => {
    await expect({
      file: 'apps/admin-api/test/app/__fixture__.e2e-spec.ts',
      code: 'import { REDIS_CLIENT } from "@acme-libs/cache/testing";',
    }).toPassArchitectureLint();
  });

  it('an infrastructure adapter MAY import the event publisher port by its alias', async () => {
    await expect({
      file: 'apps/client-api/src/features/item/infrastructure/events/__fixture__.ts',
      code: 'import { EVENT_PUBLISHER_PORT } from "@acme-libs/contracts/messaging";',
    }).toPassArchitectureLint();
  });

  it('the application may NOT import the event publisher port, it publishes through its own port', async () => {
    await expect({
      file: 'apps/client-api/src/features/item/application/use-cases/__fixture__.ts',
      code: 'import { EVENT_PUBLISHER_PORT } from "@acme-libs/contracts/messaging";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the app root MAY import the messaging lib by its alias', async () => {
    await expect({
      file: 'apps/client-api/src/app/app.module.ts',
      code: 'import { EventsModule } from "@acme-libs/messaging";',
    }).toPassArchitectureLint();
  });

  it('an infrastructure adapter may NOT import the messaging lib root', async () => {
    await expect({
      file: 'apps/client-api/src/features/item/infrastructure/events/__fixture__.ts',
      code: 'import { EventsModule } from "@acme-libs/messaging";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the health probes MAY import the cache contracts and their own contracts by their aliases', async () => {
    await expect({
      file: 'libs/health/src/infrastructure/probes/__fixture__.ts',
      code: 'import { CACHE_KEYS, CACHE_PORT } from "@acme-libs/contracts/cache";\nimport { IHealthLibDependencyView } from "@acme-libs/contracts/health";',
    }).toPassArchitectureLint();
  });

  it('the health lib may NOT import the cache lib root, it probes through the cache port', async () => {
    await expect({
      file: 'libs/health/src/infrastructure/probes/__fixture__.ts',
      code: 'import { CacheModule } from "@acme-libs/cache";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a controller may NOT import the health lib root, only a module wires it', async () => {
    await expect({
      file: 'apps/admin-api/src/features/item/presentation/controllers/__fixture__.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each(['apps/admin-api/src/main.ts', 'apps/client-api/src/main.ts'])(
    '%s MAY import the openapi lib by its alias',
    async (file) => {
      await expect({
        file,
        code: 'import { ApiReference } from "@acme-libs/openapi";',
      }).toPassArchitectureLint();
    },
  );

  it.each([
    'apps/admin-api/src/app/app.module.ts',
    'apps/admin-api/src/features/item/presentation/controllers/__fixture__.ts',
  ])('%s may NOT import the openapi lib, the document is built at startup only', async (file) => {
    await expect({
      file,
      code: 'import { ApiReference } from "@acme-libs/openapi";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/admin-api/src/app/app.module.ts',
    'apps/admin-api/src/common/shared/auth/__fixture__.ts',
  ])('%s MAY import the http lib by its alias', async (file) => {
    await expect({
      file,
      code: 'import { HttpExceptionFilter, StrictValidationPipe } from "@acme-libs/http";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/admin-api/src/features/item/application/use-cases/__fixture__.ts',
    'apps/admin-api/src/features/item/domain/__fixture__.ts',
  ])('%s may NOT import the http lib, HTTP stays out of the core layers', async (file) => {
    await expect({
      file,
      code: 'import { HttpExceptionFilter } from "@acme-libs/http";',
    }).toBreakRule('boundaries/dependencies');
  });
});
