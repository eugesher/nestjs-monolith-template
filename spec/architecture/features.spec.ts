import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('features', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__features-fixture__/src/features/index.ts',
      'apps/__features-fixture__/src/features/item/item.module.ts',
      'apps/__features-fixture__/src/features/item/domain/index.ts',
      'apps/__features-fixture__/src/features/item/domain/models/item.model.ts',
      'apps/__features-fixture__/src/features/item/outbound/index.ts',
      'apps/__features-fixture__/src/features/item/application/index.ts',
      'apps/__features-fixture__/src/features/item/infrastructure/index.ts',
      'apps/__features-fixture__/src/features/item/infrastructure/hasher/item-hasher.adapter.ts',
      'apps/__features-fixture__/src/features/item/infrastructure/persistence/repositories/item.repository.ts',
      'apps/__features-fixture__/src/features/item/presentation/index.ts',
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
        file: 'apps/__features-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure may NOT re-export application', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
        code: 'export * from "../../application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure may NOT import application dynamically', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
        code: 'export const load = () => import("../../application");',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure MAY reach its own domain and outbound', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../domain";\nimport { y } from "../../outbound";',
      }).toPassArchitectureLint();
    });

    it('application MAY reach its own domain and outbound', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../domain";\nimport { y } from "../../outbound";',
      }).toPassArchitectureLint();
    });

    it('application may NOT reach infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../infrastructure";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('application may NOT reach entities — tables are infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('application MAY use the observability lib', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../../../../../../libs/observability/src";',
      }).toPassArchitectureLint();
    });

    it('application may NOT use the cache lib — caching is an adapter behind a port', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../../../../../../libs/cache/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('presentation may NOT reach infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
        code: 'import { x } from "../../infrastructure";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the module root MAY see every layer of its own module', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/__fixture__.ts',
        code:
          'import { x } from "./application";\n' +
          'import { y } from "./infrastructure";\n' +
          'import { z } from "./presentation";',
      }).toPassArchitectureLint();
    });

    it('the module root may NOT import entities — it wires them through infrastructure', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/__fixture__.ts',
        code: 'import { x } from "../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the module root MAY import @nestjs/common', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/__fixture__.ts',
        code: 'import { Module } from "@nestjs/common";',
      }).toPassArchitectureLint();
    });

    it('presentation MAY import the HTTP and OpenAPI decorators', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
        code: 'import { Controller, Get } from "@nestjs/common";\nimport { ApiOkResponse } from "@nestjs/swagger";',
      }).toPassArchitectureLint();
    });

    it.each(['application', 'domain'])(
      '%s may NOT import the OpenAPI decorators',
      async (layer) => {
        await expect({
          file: `apps/__features-fixture__/src/features/item/${layer}/__fixture__.ts`,
          code: 'import { ApiProperty } from "@nestjs/swagger";',
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('the module root may NOT import a package off its allowlist', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/__fixture__.ts',
        code: 'import { x } from "@nestjs/core";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('layer barrels', () => {
    it('a cross-layer import may NOT skip the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../domain/models/item.model";',
      }).toBreakRule('no-restricted-syntax');
    });

    it('a cross-layer re-export may NOT skip the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'export * from "../../domain/models/item.model";',
      }).toBreakRule('no-restricted-syntax');
    });

    it('a cross-layer dynamic import may NOT skip the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'export const load = () => import("../../domain/models/item.model");',
      }).toBreakRule('no-restricted-syntax');
    });

    it('a cross-layer import MAY go through the target layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        code: 'import { x } from "../../domain";',
      }).toPassArchitectureLint();
    });

    it('an import inside the domain layer MAY use a direct file path', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/domain/exceptions/__fixture__.ts',
        code: 'import { x } from "../models/item.model";',
      }).toPassArchitectureLint();
    });

    it('an import inside the infrastructure layer MAY use a direct file path', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../hasher/item-hasher.adapter";',
      }).toPassArchitectureLint();
    });

    it('the module root MAY import a layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/__fixture__.ts',
        code: 'import { x } from "./infrastructure";',
      }).toPassArchitectureLint();
    });

    it('the module root may NOT skip a layer barrel', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/__fixture__.ts',
        code: 'import { x } from "./infrastructure/persistence/repositories/item.repository";',
      }).toBreakRule('no-restricted-syntax');
    });
  });

  describe('features and apps are isolated', () => {
    it('a module may NOT reach another module of the same app', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/item/__fixture__.ts',
        code: 'import { x } from "../note/application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('an app may NOT reach another app', async () => {
      await expect({
        file: 'apps/__features-other-fixture__/src/features/health/__fixture__.ts',
        code: 'import { x } from "../../../../__features-fixture__/src/features/item/item.module";',
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
        code: 'import { x } from "../features/item/item.module";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the features index MAY re-export a module root', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/index.ts',
        code: 'export * from "./item/item.module";',
      }).toPassArchitectureLint();
    });

    it('the features index may NOT re-export a layer', async () => {
      await expect({
        file: 'apps/__features-fixture__/src/features/index.ts',
        code: 'export * from "./item/application";',
      }).toBreakRule('boundaries/dependencies');
    });
  });
});
