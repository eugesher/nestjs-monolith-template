import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('features', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__features-fixture__/src/contracts/ledger-record/index.ts',
      'apps/__features-fixture__/src/features/index.ts',
      'apps/__features-fixture__/src/features/product/product.module.ts',
      'apps/__features-fixture__/src/features/product/domain/index.ts',
      'apps/__features-fixture__/src/features/product/domain/models/product.model.ts',
      'apps/__features-fixture__/src/features/product/outbound/index.ts',
      'apps/__features-fixture__/src/features/product/application/index.ts',
      'apps/__features-fixture__/src/features/product/infrastructure/index.ts',
      'apps/__features-fixture__/src/features/product/infrastructure/hasher/product-hasher.adapter.ts',
      'apps/__features-fixture__/src/features/product/infrastructure/persistence/repositories/product.repository.ts',
      'apps/__features-fixture__/src/features/product/presentation/index.ts',
      'apps/__features-fixture__/src/features/note/application/index.ts',
      'core/entities/src/index.ts',
      'libs/cache/src/index.ts',
      'libs/observability/src/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  describe('feature layers', () => {
    it('infrastructure may NOT import application', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure may NOT re-export application', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        code: 'export * from "../../application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure may NOT import application dynamically', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        code: 'export const load = () => import("../../application");',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure MAY reach its own domain and outbound', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../domain";\nimport { y } from "../../outbound";',
      }).toPassArchitectureLint();
    });

    it('application MAY reach its own domain and outbound', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../domain";\nimport { y } from "../../outbound";',
      }).toPassArchitectureLint();
    });

    it('application may NOT reach infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../infrastructure";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('application may NOT reach entities — tables are infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('application MAY use the observability lib', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../../../../../../libs/observability/src";',
      }).toPassArchitectureLint();
    });

    it('application may NOT use the cache lib — caching is an adapter behind a port', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../../../../../../libs/cache/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('presentation may NOT reach infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/presentation/controllers/__fixture__.ts',
        code: 'import { x } from "../../infrastructure";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the module root MAY see every layer of its own module', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/__fixture__.ts',
        code:
          'import { x } from "./application";\n' +
          'import { y } from "./infrastructure";\n' +
          'import { z } from "./presentation";',
      }).toPassArchitectureLint();
    });

    it('the module root may NOT import entities — it wires them through infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the module root MAY import @nestjs/common', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/__fixture__.ts',
        code: 'import { Module } from "@nestjs/common";',
      }).toPassArchitectureLint();
    });

    it('presentation MAY import the HTTP and OpenAPI decorators', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/presentation/controllers/__fixture__.ts',
        code: 'import { Controller, Get } from "@nestjs/common";\nimport { ApiOkResponse } from "@nestjs/swagger";',
      }).toPassArchitectureLint();
    });

    it.each(['application', 'domain'])(
      '%s may NOT import the OpenAPI decorators',
      async (layer) => {
        await expect({
          file: `apps/__features-fixture__/src/features/product/${layer}/__fixture__.ts`,
          code: 'import { ApiProperty } from "@nestjs/swagger";',
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('application MAY import the DI decorators of @nestjs/common', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { Inject, Injectable } from "@nestjs/common";',
      }).toPassArchitectureLint();
    });

    it('a core-adapter MAY import the DI decorators of @nestjs/common', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { Inject, Injectable } from "@nestjs/common";',
      }).toPassArchitectureLint();
    });

    it('domain may NOT import @nestjs/common', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/domain/__fixture__.ts',
        code: 'import { Injectable } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure MAY read tables through the transaction host', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        code: [
          'import { Injectable } from "@nestjs/common";',
          'import { TypeOrmModule } from "@nestjs/typeorm";',
          'import { TransactionHost } from "@nestjs-cls/transactional";',
          'import { TransactionalAdapterTypeOrm } from "@nestjs-cls/transactional-adapter-typeorm";',
          'import { Repository } from "typeorm";',
        ].join('\n'),
      }).toPassArchitectureLint();
    });

    it.each(['application', 'domain', 'outbound', 'infrastructure/queue'])(
      '%s may NOT import typeorm — tables are persistence',
      async (layer) => {
        await expect({
          file: `apps/__features-fixture__/src/features/product/${layer}/__fixture__.ts`,
          code: 'import { Repository } from "typeorm";',
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('infrastructure/queue MAY reach app contracts and inject a Bull queue', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/queue/__fixture__.ts',
        code: [
          'import { InjectQueue } from "@nestjs/bull";',
          'import { Injectable } from "@nestjs/common";',
          'import type { Queue } from "bull";',
          'import { x } from "../../../../contracts/ledger-record";',
        ].join('\n'),
      }).toPassArchitectureLint();
    });

    it.each(['import { BullModule } from "@nestjs/bull";', 'import type { Job } from "bull";'])(
      'infrastructure/queue may NOT take more than InjectQueue and the Queue type (%s)',
      async (code) => {
        await expect({
          file: 'apps/__features-fixture__/src/features/product/infrastructure/queue/__fixture__.ts',
          code,
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('infrastructure/queue may NOT reach a lib contract', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/queue/__fixture__.ts',
        code: 'import { y } from "../../../../../../../libs/contracts/src/database";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each(['infrastructure/persistence', 'infrastructure/core-adapters', 'application/services'])(
      '%s may NOT reach app contracts — only common-adapters and queue do',
      async (folder) => {
        await expect({
          file: `apps/__features-fixture__/src/features/product/${folder}/__fixture__.ts`,
          code: 'import { x } from "../../../../contracts/ledger-record";',
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('infrastructure/common-adapters MAY reach app contracts with the DI decorators', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { Inject, Injectable } from "@nestjs/common";\nimport { x } from "../../../../contracts/ledger-record";',
      }).toPassArchitectureLint();
    });

    it('presentation MAY import the request validation packages', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/presentation/dto/__fixture__.ts',
        code: 'import { IsString } from "class-validator";\nimport { plainToInstance } from "class-transformer";',
      }).toPassArchitectureLint();
    });

    it.each(['application', 'domain', 'infrastructure', 'outbound'])(
      '%s may NOT import class-validator — request validation is a presentation job',
      async (layer) => {
        await expect({
          file: `apps/__features-fixture__/src/features/product/${layer}/__fixture__.ts`,
          code: 'import { IsString } from "class-validator";',
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('the module root may NOT import a package off its allowlist', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "@nestjs/core";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('layer barrels', () => {
    it('a cross-layer import may NOT skip the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../domain/models/product.model";',
      }).toBreakRule('no-restricted-syntax');
    });

    it('a cross-layer re-export may NOT skip the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'export * from "../../domain/models/product.model";',
      }).toBreakRule('no-restricted-syntax');
    });

    it('a cross-layer dynamic import may NOT skip the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'export const load = () => import("../../domain/models/product.model");',
      }).toBreakRule('no-restricted-syntax');
    });

    it('a cross-layer import MAY go through the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../domain";',
      }).toPassArchitectureLint();
    });

    it('an import inside the domain layer MAY use a direct file path', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/domain/exceptions/__fixture__.ts',
        code: 'import { x } from "../models/product.model";',
      }).toPassArchitectureLint();
    });

    it('an import inside the infrastructure layer MAY use a direct file path', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../hasher/product-hasher.adapter";',
      }).toPassArchitectureLint();
    });

    it('the module root MAY import a layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "./infrastructure";',
      }).toPassArchitectureLint();
    });

    it('the module root may NOT skip a layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "./infrastructure/persistence/repositories/product.repository";',
      }).toBreakRule('no-restricted-syntax');
    });
  });

  describe('features and apps are isolated', () => {
    it('a module may NOT reach another module of the same app', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "../note/application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('an app may NOT reach another app', async () => {
      await expect({
        file: 'apps/__features-other-fixture__/src/features/health/__fixture__.ts',
        code: 'import { x } from "../../../../__features-fixture__/src/features/product/product.module";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('bootstrap MAY mount modules through the features index', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/app/__fixture__.ts',
        code: 'import { x } from "../features";',
      }).toPassArchitectureLint();
    });

    it('bootstrap may NOT reach a module past the features index', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/app/__fixture__.ts',
        code: 'import { x } from "../features/product/product.module";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the features index MAY re-export a module root', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/index.ts',
        code: 'export * from "./product/product.module";',
      }).toPassArchitectureLint();
    });

    it('the features index may NOT re-export a layer', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/index.ts',
        code: 'export * from "./product/application";',
      }).toBreakRule('boundaries/dependencies');
    });
  });
});
