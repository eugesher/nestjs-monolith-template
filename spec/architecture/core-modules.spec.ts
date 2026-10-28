import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('core modules', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'core/modules/src/__ledger-fixture__/index.ts',
      'core/modules/src/__ledger-fixture__/module/ledger.module.ts',
      'core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts',
      'core/modules/src/__ledger-fixture__/application/index.ts',
      'core/modules/src/__ledger-fixture__/infrastructure/index.ts',
      'core/modules/src/__ledger-fixture__/infrastructure/cache/ledger-core-cache.adapter.ts',
      'core/modules/src/__identity-fixture__/application/index.ts',
      'core/contracts/src/__ledger-fixture__/index.ts',
      'core/contracts/src/__identity-fixture__/index.ts',
      'core/entities/src/index.ts',
      'apps/__core-fixture__/src/features/item/item.module.ts',
      'libs/cache/src/index.ts',
      'libs/kernel/src/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  describe('isolation and contracts', () => {
    it('a core module may NOT reach another core module', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
        code: 'import { x } from "../../__identity-fixture__/application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a core module MAY reach its own contracts', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/src/__ledger-fixture__";',
      }).toPassArchitectureLint();
    });

    it('a core module may NOT reach the contracts of another module', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/src/__identity-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each(['@acme-core/contracts/identity', '@acme-core/modules/identity'])(
      'ledger may NOT reach %s — the journal records facts, it never asks who the user is',
      async (alias) => {
        await expect({
          file: 'core/modules/src/ledger/application/use-cases/__fixture__.ts',
          code: `import { x } from "${alias}";`,
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('ledger MAY reach its own contracts through the alias', async () => {
      await expect({
        file: 'core/modules/src/ledger/application/use-cases/__fixture__.ts',
        code: 'import { LEDGER_CORE_APPEND_PORT } from "@acme-core/contracts/ledger";',
      }).toPassArchitectureLint();
    });

    it('core application may NOT reach its own infrastructure', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
        code: 'import { x } from "../infrastructure";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a core module may NOT import an app', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
        code: 'import { x } from "../../../../../apps/__core-fixture__/src/features/item/item.module";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('core contracts may NOT reach core modules', async () => {
      await expect({
        file: 'core/contracts/src/__ledger-fixture__/__fixture__.ts',
        code: 'import { x } from "../../../modules/src/__ledger-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('the module barrel and module/', () => {
    it('the core module barrel MAY export the nest module', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/index.ts',
        code: 'export * from "./module/ledger.module";',
      }).toPassArchitectureLint();
    });

    it('the core module barrel may NOT export anything else', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/index.ts',
        code: 'export * from "./application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the core module root MAY import its services and layer barrels', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
        code: 'import { x } from "./ledger-core.facade";\nimport { y } from "../infrastructure";',
      }).toPassArchitectureLint();
    });

    it('the core module root may NOT reach layer internals', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
        code: 'import { x } from "../infrastructure/cache/ledger-core-cache.adapter";',
      }).toBreakRule('no-restricted-syntax');
    });

    it('the composition root may NOT import entities — it wires them through infrastructure', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
        code: 'import { x } from "../../../../entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a facade MAY reach the application layer and its own contracts', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts',
        code: 'import { x } from "../application";\nimport { y } from "../../../../contracts/src/__ledger-fixture__";',
      }).toPassArchitectureLint();
    });

    it.each([
      '../infrastructure',
      '../../../../entities/src',
      '../../../../../libs/cache/src',
      '../../../../contracts/src/__identity-fixture__',
    ])('a facade may NOT reach %s', async (source) => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });

    it('a facade may NOT import the HTTP platform', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts',
        code: 'import { x } from "@nestjs/platform-express";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('@nestjs/common without an HTTP surface', () => {
    it('a core module may NOT declare HTTP controllers', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
        code: 'import { Controller } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each([
      'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
      'apps/__core-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
      'apps/__core-fixture__/src/processors/purge/__fixture__.ts',
    ])('%s MAY take the DI names from @nestjs/common', async (file) => {
      await expect({
        file,
        code: 'import { DynamicModule, Inject, Injectable, Module } from "@nestjs/common";',
      }).toPassArchitectureLint();
    });

    it.each(['ModuleMetadata', 'Type'])(
      'core and common modules and processors may NOT take %s, no module takes options',
      async (name) => {
        await expect({
          file: 'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
          code: `import { ${name} } from "@nestjs/common";`,
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it.each([
      'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
      'apps/__core-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
      'apps/__core-fixture__/src/processors/purge/__fixture__.ts',
    ])('%s may NOT slip an HTTP name in next to a DI name', async (file) => {
      await expect({
        file,
        code: 'import { Injectable, Get } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each([
      'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
      'apps/__core-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
      'apps/__core-fixture__/src/processors/purge/__fixture__.ts',
    ])('%s may NOT import @nestjs/common as a namespace', async (file) => {
      await expect({
        file,
        code: 'import * as common from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('packages and lib contracts', () => {
    it('infrastructure MAY import the persistence, hashing and token packages', async () => {
      await expect({
        file: 'core/modules/src/__ledger-fixture__/infrastructure/__fixture__.ts',
        code:
          'import { TransactionHost } from "@nestjs-cls/transactional";\n' +
          'import { TransactionalAdapterTypeOrm } from "@nestjs-cls/transactional-adapter-typeorm";\n' +
          'import { JwtModule, JwtService } from "@nestjs/jwt";\n' +
          'import { TypeOrmModule } from "@nestjs/typeorm";\n' +
          'import { hash } from "argon2";\n' +
          'import { Repository } from "typeorm";',
      }).toPassArchitectureLint();
    });

    it.each([
      ['domain', 'argon2'],
      ['domain', '@nestjs/jwt'],
      ['outbound', 'argon2'],
      ['application', 'argon2'],
      ['application', '@nestjs/jwt'],
      ['application', 'typeorm'],
      ['module', 'argon2'],
      ['module', '@nestjs/jwt'],
      ['module', '@nestjs/typeorm'],
    ])('%s may NOT import %s, only infrastructure talks to it', async (layer, source) => {
      await expect({
        file: `core/modules/src/__ledger-fixture__/${layer}/__fixture__.ts`,
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });

    it('application MAY take the transaction port and the logger', async () => {
      await expect({
        file: 'core/modules/src/identity/application/use-cases/__fixture__.ts',
        code:
          'import { ITransactionPort, TRANSACTION_PORT } from "@acme-libs/contracts/database";\n' +
          'import { PinoLogger } from "nestjs-pino";',
      }).toPassArchitectureLint();
    });

    it('application may NOT take the cache port, caching is an adapter behind a port', async () => {
      await expect({
        file: 'core/modules/src/identity/application/use-cases/__fixture__.ts',
        code: 'import { CACHE_PORT } from "@acme-libs/contracts/cache";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the module root MAY bind config values with the config lib', async () => {
      await expect({
        file: 'core/modules/src/identity/module/__fixture__.ts',
        code: 'import { ConfigProviderHelper } from "@acme-libs/config";',
      }).toPassArchitectureLint();
    });

    it.each(['application', 'infrastructure'])(
      '%s may NOT read the config, values come in as tokens',
      async (layer) => {
        await expect({
          file: `core/modules/src/identity/${layer}/__fixture__.ts`,
          code: 'import { ConfigService } from "@nestjs/config";',
        }).toBreakRule('boundaries/dependencies');
      },
    );
  });

  describe('identity ports by app', () => {
    it.each(['admin-api', 'client-api'])(
      'a %s core adapter MAY import the identity session port',
      async (app) => {
        await expect({
          file: `apps/${app}/src/features/session/infrastructure/core-adapters/__fixture__.ts`,
          code: 'import { IDENTITY_CORE_SESSION_PORT, IIdentityCoreSessionPort } from "@acme-core/contracts/identity";',
        }).toPassArchitectureLint();
      },
    );

    it('an admin-api core adapter MAY import the identity admin port', async () => {
      await expect({
        file: 'apps/admin-api/src/features/iam/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { IDENTITY_CORE_ADMIN_PORT, IIdentityCoreAdminPort } from "@acme-core/contracts/identity";',
      }).toPassArchitectureLint();
    });

    it.each([
      'apps/client-api/src/features/session/infrastructure/core-adapters/__fixture__.ts',
      'apps/client-api/src/app/global/auth/infrastructure/core-adapters/__fixture__.ts',
    ])('%s may NOT import the identity admin port', async (file) => {
      await expect({
        file,
        code: 'import { IDENTITY_CORE_ADMIN_PORT } from "@acme-core/contracts/identity";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a client-api core adapter may NOT slip the admin port type in next to the session port', async () => {
      await expect({
        file: 'apps/client-api/src/features/session/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { IDENTITY_CORE_SESSION_PORT, IIdentityCoreAdminPort } from "@acme-core/contracts/identity";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('core entities', () => {
    it('entities MAY reach the kernel lib', async () => {
      await expect({
        file: 'core/entities/src/__fixture__.ts',
        code: 'import { x } from "../../../libs/kernel/src";',
      }).toPassArchitectureLint();
    });

    it('entities may NOT reach other libs', async () => {
      await expect({
        file: 'core/entities/src/__fixture__.ts',
        code: 'import { x } from "../../../libs/cache/src";',
      }).toBreakRule('boundaries/dependencies');
    });
  });
});
