import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('unused edges', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__unused-fixture__/src/common/shared/concurrency/index.ts',
      'apps/__unused-fixture__/src/contracts/idempotency/index.ts',
      'apps/__unused-fixture__/src/common/modules/idempotency/domain/index.ts',
      'apps/__unused-fixture__/src/features/product/domain/index.ts',
      'apps/__unused-fixture__/src/app/setup/config/config-setup.module.ts',
      'core/modules/src/__unused-fixture__/domain/index.ts',
      'core/contracts/src/__unused-fixture__/index.ts',
      'core/entities/src/index.ts',
      'libs/config/src/index.ts',
      'libs/database/src/index.ts',
      'libs/http/src/index.ts',
      'libs/observability/src/index.ts',
      'libs/contracts/src/auth/index.ts',
      'libs/contracts/src/cache/index.ts',
      'libs/contracts/src/database/index.ts',
      'libs/contracts/src/messaging/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  describe('bootstrap', () => {
    it.each([
      [
        'main may NOT import @nestjs/common: the app module binds the global pipes and filters as providers',
        'apps/__unused-fixture__/src/main.ts',
        '@nestjs/common',
      ],
    ])('%s', async (_, file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });
  });

  describe('app root', () => {
    it.each([
      [
        'the app module may NOT reach a shared barrel: shared code is used by the modules it mounts',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '../common/shared/concurrency',
      ],
      [
        'the app module may NOT reach the entities: the ORM setup module registers them',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '../../../../core/entities/src',
      ],
      [
        'the app module may NOT reach the config lib: the config setup module binds it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '../../../../libs/config/src',
      ],
      [
        'the app module may NOT reach the database lib: the ORM setup module wires it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '../../../../libs/database/src',
      ],
      [
        'the app module may NOT reach the database contracts: the ORM setup module wires them',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '../../../../libs/contracts/src/database',
      ],
      [
        'the app module may NOT import @nestjs-cls/transactional: a setup module in app/setup configures it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '@nestjs-cls/transactional',
      ],
      [
        'the app module may NOT import @nestjs-cls/transactional-adapter-typeorm: a setup module in app/setup configures it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '@nestjs-cls/transactional-adapter-typeorm',
      ],
      [
        'the app module may NOT import @nestjs/config: a setup module in app/setup configures it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '@nestjs/config',
      ],
      [
        'the app module may NOT import @nestjs/typeorm: a setup module in app/setup configures it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        '@nestjs/typeorm',
      ],
      [
        'the app module may NOT import joi: a setup module in app/setup configures it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        'joi',
      ],
      [
        'the app module may NOT import nestjs-cls: a setup module in app/setup configures it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        'nestjs-cls',
      ],
      [
        'the app module may NOT import typeorm: a setup module in app/setup configures it',
        'apps/__unused-fixture__/src/app/app.module.ts',
        'typeorm',
      ],
      [
        'a setup module may NOT reach a shared barrel: shared code is used by the modules',
        'apps/__unused-fixture__/src/app/setup/orm/__fixture__.ts',
        '../../../common/shared/concurrency',
      ],
      [
        'a setup module may NOT reach the http lib: the app module binds the global pipes and filters',
        'apps/__unused-fixture__/src/app/setup/orm/__fixture__.ts',
        '../../../../../../libs/http/src',
      ],
      [
        'a setup module may NOT reach the observability lib: the app module sets up the logger',
        'apps/__unused-fixture__/src/app/setup/orm/__fixture__.ts',
        '../../../../../../libs/observability/src',
      ],
    ])('%s', async (_, file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });

    it('the app module may NOT import ScheduleModule: the schedule setup module configures it', async () => {
      await expect({
        file: 'apps/__unused-fixture__/src/app/app.module.ts',
        code: 'import { ScheduleModule } from "@nestjs/schedule";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('global modules', () => {
    it.each([
      [
        'the root of a global module may NOT reach the observability lib: it wires providers and logs nothing',
        'apps/__unused-fixture__/src/app/global/auth/module/__fixture__.ts',
        '../../../../../../../libs/observability/src',
      ],
      [
        'global infrastructure may NOT reach the contracts of its namesake lib: a core-adapter implements the lib port',
        'apps/__unused-fixture__/src/app/global/auth/infrastructure/__fixture__.ts',
        '../../../../../../../libs/contracts/src/auth',
      ],
      [
        'a global core-adapter may NOT reach a shared barrel: it translates between contracts only',
        'apps/__unused-fixture__/src/app/global/auth/infrastructure/core-adapters/__fixture__.ts',
        '../../../../../common/shared/concurrency',
      ],
    ])('%s', async (_, file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });
  });

  describe('e2e', () => {
    it.each([
      [
        'the e2e code may NOT reach a setup module: it boots the whole app module',
        'apps/__unused-fixture__/test/context/__fixture__.ts',
        '../../src/app/setup/config/config-setup.module.ts',
      ],
      [
        'the e2e code may NOT reach the contracts of a lib: it reads Redis through the test entry point of the cache lib',
        'apps/__unused-fixture__/test/context/__fixture__.ts',
        '../../../../libs/contracts/src/cache',
      ],
      [
        'the e2e code may NOT reach the http lib: it checks HTTP from outside the app',
        'apps/__unused-fixture__/test/context/__fixture__.ts',
        '../../../../libs/http/src',
      ],
    ])('%s', async (_, file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });
  });

  describe('features', () => {
    it.each([
      [
        'feature application may NOT reach a shared barrel: shared code serves the HTTP surface',
        'apps/__unused-fixture__/src/features/product/application/__fixture__.ts',
        '../../../common/shared/concurrency',
      ],
      [
        'feature infrastructure may NOT reach the messaging contracts: events are published from infrastructure/events',
        'apps/__unused-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        '../../../../../../../libs/contracts/src/messaging',
      ],
      [
        'feature presentation may NOT reach the observability lib: the middleware of the app sets the correlation id',
        'apps/__unused-fixture__/src/features/product/presentation/controllers/__fixture__.ts',
        '../../../../../../../libs/observability/src',
      ],
      [
        'the feature root may NOT reach its domain: it wires providers, and the domain has none',
        'apps/__unused-fixture__/src/features/product/__fixture__.ts',
        './domain',
      ],
    ])('%s', async (_, file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });
  });

  describe('common modules', () => {
    it.each([
      [
        'common outbound may NOT reach the contracts of its module: a port speaks the module types, the contracts serve consumers',
        'apps/__unused-fixture__/src/common/modules/idempotency/outbound/__fixture__.ts',
        '../../../../contracts/idempotency',
      ],
      [
        'common infrastructure may NOT reach the contracts of its module: it implements outbound ports',
        'apps/__unused-fixture__/src/common/modules/idempotency/infrastructure/persistence/__fixture__.ts',
        '../../../../../contracts/idempotency',
      ],
      [
        'common infrastructure may NOT reach the contracts of a lib: only feature infrastructure caches',
        'apps/__unused-fixture__/src/common/modules/idempotency/infrastructure/persistence/__fixture__.ts',
        '../../../../../../../../libs/contracts/src/cache',
      ],
      [
        'a common facade may NOT reach the http lib: it hands the call to a use case',
        'apps/__unused-fixture__/src/common/modules/idempotency/module/__fixture__.facade.ts',
        '../../../../../../../libs/http/src',
      ],
      [
        'a common facade may NOT reach the observability lib: it hands the call to a use case',
        'apps/__unused-fixture__/src/common/modules/idempotency/module/__fixture__.facade.ts',
        '../../../../../../../libs/observability/src',
      ],
      [
        'the common module root may NOT reach its domain: it wires providers, and the domain has none',
        'apps/__unused-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        '../domain',
      ],
    ])('%s', async (_, file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });
  });

  describe('core modules', () => {
    it.each([
      [
        'core outbound may NOT reach the contracts of its module: a port speaks the module types, the contracts serve consumers',
        'core/modules/src/__unused-fixture__/outbound/__fixture__.ts',
        '../../../../contracts/src/__unused-fixture__',
      ],
      [
        'core infrastructure may NOT reach the contracts of its module: it implements outbound ports',
        'core/modules/src/__unused-fixture__/infrastructure/persistence/__fixture__.ts',
        '../../../../../contracts/src/__unused-fixture__',
      ],
      [
        'core infrastructure may NOT reach the contracts of a lib: only feature infrastructure caches',
        'core/modules/src/__unused-fixture__/infrastructure/persistence/__fixture__.ts',
        '../../../../../../libs/contracts/src/cache',
      ],
      [
        'a core facade may NOT reach the http lib: it hands the call to a use case',
        'core/modules/src/__unused-fixture__/module/__fixture__.facade.ts',
        '../../../../../libs/http/src',
      ],
      [
        'a core facade may NOT reach the observability lib: it hands the call to a use case',
        'core/modules/src/__unused-fixture__/module/__fixture__.facade.ts',
        '../../../../../libs/observability/src',
      ],
      [
        'the core module root may NOT reach its domain: it wires providers, and the domain has none',
        'core/modules/src/__unused-fixture__/module/__fixture__.ts',
        '../domain',
      ],
    ])('%s', async (_, file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });
  });
});
