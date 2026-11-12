import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';

import '../support/lint';

describe('lib entry points', () => {
  it('libs/ holds exactly the libs the edge table in libs.spec.ts knows about', () => {
    const libs = readdirSync(path.resolve(__dirname, '../../libs')).sort();

    expect(libs).toEqual([
      'auth',
      'cache',
      'config',
      'contracts',
      'credentials',
      'database',
      'health',
      'http',
      'kernel',
      'ledger',
      'local-storage',
      'observability',
      'openapi',
      'queue',
      'testing',
      'toolkit',
    ]);
  });

  it('tsconfig publishes exactly these lib aliases', () => {
    const tsconfig = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8'),
    ) as { compilerOptions: { paths: Record<string, string[]> } };

    const libAliases = Object.keys(tsconfig.compilerOptions.paths).filter((alias) =>
      alias.startsWith('@acme-libs/'),
    );

    expect(libAliases).toEqual([
      '@acme-libs/auth',
      '@acme-libs/auth/*',
      '@acme-libs/cache',
      '@acme-libs/cache/*',
      '@acme-libs/config',
      '@acme-libs/config/*',
      '@acme-libs/contracts',
      '@acme-libs/contracts/*',
      '@acme-libs/credentials',
      '@acme-libs/credentials/*',
      '@acme-libs/database',
      '@acme-libs/database/*',
      '@acme-libs/health',
      '@acme-libs/health/*',
      '@acme-libs/http',
      '@acme-libs/http/*',
      '@acme-libs/kernel',
      '@acme-libs/kernel/*',
      '@acme-libs/ledger',
      '@acme-libs/ledger/*',
      '@acme-libs/local-storage',
      '@acme-libs/local-storage/*',
      '@acme-libs/observability',
      '@acme-libs/observability/*',
      '@acme-libs/openapi',
      '@acme-libs/openapi/*',
      '@acme-libs/queue',
      '@acme-libs/queue/*',
      '@acme-libs/testing',
      '@acme-libs/testing/*',
      '@acme-libs/toolkit',
      '@acme-libs/toolkit/*',
    ]);
  });

  it.each([
    '@acme-libs/auth',
    '@acme-libs/cache',
    '@acme-libs/config',
    '@acme-libs/contracts/auth',
    '@acme-libs/contracts/cache',
    '@acme-libs/contracts/credentials',
    '@acme-libs/contracts/database',
    '@acme-libs/contracts/health',
    '@acme-libs/contracts/ledger',
    '@acme-libs/contracts/local-storage',
    '@acme-libs/credentials',
    '@acme-libs/database',
    '@acme-libs/health',
    '@acme-libs/http',
    '@acme-libs/kernel',
    '@acme-libs/ledger',
    '@acme-libs/local-storage',
    '@acme-libs/observability',
    '@acme-libs/observability/tracer',
    '@acme-libs/openapi',
    '@acme-libs/queue',
    '@acme-libs/testing',
    '@acme-libs/toolkit',
  ])('%s resolves', (source) => {
    expect(source).toResolve();
  });

  it.each(['@acme-libs/toolkit/src'])(
    'a path outside the src of a lib does not resolve: %s',
    (source) => {
      expect(source).not.toResolve();
    },
  );

  it.each([
    '@acme-libs/kernel/app/app-name.enum',
    '@acme-libs/toolkit/ddd/entity.base',
    '@acme-libs/config/env/env.helper',
    '@acme-libs/local-storage/transaction/shell/local-storage-transaction.module',
    '@acme-libs/database/orm/infrastructure/host/orm-host.adapter',
    '@acme-libs/http/filters/http-exception.filter',
    '@acme-libs/openapi/api-reference/api-reference',
    '@acme-libs/queue/bull/bull-setup.module',
    '@acme-libs/health/shell/health-lib.module',
    '@acme-libs/auth/modules/auth-jwt.module',
    '@acme-libs/credentials/shell/credentials-lib.module',
    '@acme-libs/local-storage/setup/local-storage-setup.module',
    '@acme-libs/contracts/local-storage/ports/local-storage-transaction.port',
    '@acme-libs/contracts/database/ports/orm.port',
    '@acme-libs/cache/infrastructure/store/cache-lib-store.adapter',
    '@acme-libs/contracts/cache/ports/cache-lib.port',
    '@acme-libs/contracts/health/ports/health-lib.port',
    '@acme-libs/contracts/auth/ports/auth-user-validator.port',
    '@acme-libs/contracts/credentials/ports/credentials-lib.port',
  ])('a feature may NOT reach a deep path into a lib: %s', async (source) => {
    await expect({
      file: 'apps/staff-app/src/features/product/infrastructure/__fixture__.ts',
      code: `import { X } from "${source}";`,
    }).toBreakRule('no-restricted-imports');
  });

  it.each([
    'apps/staff-app/src/features/product/domain/__fixture__.ts',
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
      code: 'import { ProductStatusEnum } from "@acme-libs/kernel";',
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
    'apps/staff-app/src/features/product/application/use-cases/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
    'apps/staff-app/src/common/shared/auth/__fixture__.ts',
  ])('%s may NOT import test helpers outside specs', async (file) => {
    await expect({
      file,
      code: 'import { makePinoLoggerMock } from "@acme-libs/testing";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/staff-app/src/features/product/application/use-cases/spec/__fixture__.spec.ts',
    'core/modules/src/__ledger-fixture__/application/spec/__fixture__.spec.ts',
    'apps/staff-app/test/app/__fixture__.e2e-spec.ts',
  ])('the spec %s MAY import test helpers', async (file) => {
    await expect({
      file,
      code: 'import { makePinoLoggerMock } from "@acme-libs/testing";',
    }).toPassArchitectureLint();
  });

  it.each(['apps/staff-app/src/main.ts', 'apps/customer-app/src/main.ts'])(
    '%s MAY import the allowlisted deep entry point tracer',
    async (file) => {
      await expect({
        file,
        code: 'import "@acme-libs/observability/tracer";',
      }).toPassArchitectureLint();
    },
  );

  it.each([
    'apps/staff-app/src/features/product/infrastructure/persistence/transaction/__fixture__.ts',
    'apps/processor-app/src/processors/purge/infrastructure/persistence/transaction/__fixture__.ts',
    'apps/staff-app/src/common/modules/idempotency/infrastructure/persistence/transaction/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/infrastructure/persistence/transaction/__fixture__.ts',
  ])('%s MAY import the transaction port by its alias', async (file) => {
    await expect({
      file,
      code: 'import { TRANSACTION_PORT } from "@acme-libs/contracts/local-storage";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/features/product/domain/__fixture__.ts',
    'apps/staff-app/src/features/product/outbound/__fixture__.ts',
    'apps/staff-app/src/features/product/application/use-cases/__fixture__.ts',
    'apps/processor-app/src/processors/purge/application/services/__fixture__.ts',
    'apps/staff-app/src/common/modules/idempotency/application/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
    'apps/staff-app/src/features/product/presentation/controllers/__fixture__.ts',
    'apps/staff-app/src/app/setup/config/__fixture__.ts',
  ])(
    '%s may NOT import the transaction port by its alias, the transaction adapter of the module wraps it',
    async (file) => {
      await expect({
        file,
        code: 'import { TRANSACTION_PORT } from "@acme-libs/contracts/local-storage";',
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it('the AppModule MAY import the database lib by its alias', async () => {
    await expect({
      file: 'apps/staff-app/src/app/app.module.ts',
      code: 'import { OrmModule } from "@acme-libs/database";',
    }).toPassArchitectureLint();
  });

  it('application may NOT import the local-storage lib root, it takes the transaction port', async () => {
    await expect({
      file: 'apps/staff-app/src/features/product/application/use-cases/__fixture__.ts',
      code: 'import { LocalStorageTransactionModule } from "@acme-libs/local-storage";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/staff-app/src/common/shared/auth/__fixture__.ts',
    'apps/staff-app/src/features/reminder/infrastructure/cache/__fixture__.ts',
  ])('%s MAY import the cache contracts by their alias', async (file) => {
    await expect({
      file,
      code: 'import { CACHE_KEYS, CACHE_LIB_PORT } from "@acme-libs/contracts/cache";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/features/reminder/application/use-cases/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
  ])(
    '%s may NOT import the cache contracts by their alias, the application reads through its own port',
    async (file) => {
      await expect({
        file,
        code: 'import { CACHE_LIB_PORT } from "@acme-libs/contracts/cache";',
      }).toBreakRule('boundaries/dependencies');
    },
  );
  it('the app root MAY import the cache lib by its alias', async () => {
    await expect({
      file: 'apps/staff-app/src/app/app.module.ts',
      code: 'import { CacheLibModule } from "@acme-libs/cache";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/features/reminder/infrastructure/cache/__fixture__.ts',
    'apps/staff-app/src/common/shared/auth/__fixture__.ts',
  ])('%s may NOT import the cache lib root, only the app root wires it', async (file) => {
    await expect({
      file,
      code: 'import { CacheLibModule } from "@acme-libs/cache";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the Redis client token may NOT be imported outside specs', async () => {
    await expect({
      file: 'apps/staff-app/src/app/__fixture__.ts',
      code: 'import { CACHE_LIB_REDIS_CLIENT_TOKEN } from "@acme-libs/testing";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('an e2e spec MAY take the Redis client token', async () => {
    await expect({
      file: 'apps/staff-app/test/app/__fixture__.e2e-spec.ts',
      code: 'import { CACHE_LIB_REDIS_CLIENT_TOKEN } from "@acme-libs/testing";',
    }).toPassArchitectureLint();
  });

  it('the health probes MAY import the cache contracts and their own contracts by their aliases', async () => {
    await expect({
      file: 'libs/health/src/infrastructure/probes/__fixture__.ts',
      code: 'import { CACHE_KEYS, CACHE_LIB_PORT } from "@acme-libs/contracts/cache";\nimport { IHealthLibDependencyView } from "@acme-libs/contracts/health";',
    }).toPassArchitectureLint();
  });

  it('the health lib may NOT import the cache lib root, it probes through the cache port', async () => {
    await expect({
      file: 'libs/health/src/infrastructure/probes/__fixture__.ts',
      code: 'import { CacheLibModule } from "@acme-libs/cache";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a controller may NOT import the health lib root, only a module wires it', async () => {
    await expect({
      file: 'apps/staff-app/src/features/product/presentation/controllers/__fixture__.ts',
      code: 'import { HealthLibModule } from "@acme-libs/health";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each(['apps/staff-app/src/main.ts', 'apps/customer-app/src/main.ts'])(
    '%s MAY import the openapi lib by its alias',
    async (file) => {
      await expect({
        file,
        code: 'import { ApiReference } from "@acme-libs/openapi";',
      }).toPassArchitectureLint();
    },
  );

  it.each([
    'apps/staff-app/src/app/app.module.ts',
    'apps/staff-app/src/features/product/presentation/controllers/__fixture__.ts',
  ])('%s may NOT import the openapi lib, the document is built at startup only', async (file) => {
    await expect({
      file,
      code: 'import { ApiReference } from "@acme-libs/openapi";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/staff-app/src/app/app.module.ts',
    'apps/staff-app/src/common/shared/auth/__fixture__.ts',
  ])('%s MAY import the http lib by its alias', async (file) => {
    await expect({
      file,
      code: 'import { HttpExceptionFilter, StrictValidationPipe } from "@acme-libs/http";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/features/product/application/use-cases/__fixture__.ts',
    'apps/staff-app/src/features/product/domain/__fixture__.ts',
  ])('%s may NOT import the http lib, HTTP stays out of the core layers', async (file) => {
    await expect({
      file,
      code: 'import { HttpExceptionFilter } from "@acme-libs/http";',
    }).toBreakRule('boundaries/dependencies');
  });
});
