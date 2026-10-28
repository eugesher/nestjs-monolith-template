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
