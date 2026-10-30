import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('global modules (app/global) — modules without controllers', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__global-fixture__/src/app/global/index.ts',
      'apps/__global-fixture__/src/app/global/auth/module/auth.module.ts',
      'apps/__global-fixture__/src/app/global/auth/infrastructure/index.ts',
      'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/index.ts',
      'apps/__global-fixture__/src/app/global/auth/application/index.ts',
      'apps/__global-fixture__/src/app/global/auth/outbound/index.ts',
      'apps/__global-fixture__/src/common/modules/identity/index.ts',
      'apps/__global-fixture__/src/contracts/auth/index.ts',
      'apps/__global-fixture__/src/contracts/audit/index.ts',
      'apps/__global-fixture__/src/contracts/identity/index.ts',
      'apps/__global-fixture__/src/features/product/product.module.ts',
      'core/modules/src/__identity-fixture__/index.ts',
      'core/contracts/src/__identity-fixture__/index.ts',
      'core/entities/src/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  it('bootstrap MAY reach the global modules index', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/__fixture__.ts',
      code: 'import { x } from "./global";',
    }).toPassArchitectureLint();
  });

  it('bootstrap may NOT reach a global module past the index', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/__fixture__.ts',
      code: 'import { x } from "./global/auth/module/auth.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the index MAY re-export a module root', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/index.ts',
      code: 'export * from "./auth/module/auth.module";',
    }).toPassArchitectureLint();
  });

  it('the index may NOT re-export infrastructure', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/index.ts',
      code: 'export * from "./auth/infrastructure";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the module root MAY mount a common module', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../common/modules/identity";',
    }).toPassArchitectureLint();
  });

  it('the module root may NOT mount a core module — what one app needs lives in that app', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../../../../core/modules/src/__identity-fixture__";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the module root MAY reach app contracts and its own infrastructure', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../contracts/auth";\nimport { y } from "../infrastructure";',
    }).toPassArchitectureLint();
  });

  it('the module root may NOT import entities — it wires them through infrastructure', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../../../../core/entities/src";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the module root may NOT reach app contracts of another name', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../contracts/audit";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the module root may NOT reach core contracts', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../../../../core/contracts/src/__identity-fixture__";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the module root may NOT reach a feature', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../features/product/product.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('infrastructure/common-adapters MAY reach the contracts of a common module and its own', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
      code:
        'import { x } from "../../../../../contracts/identity";\n' +
        'import { y } from "../../../../../contracts/auth";',
    }).toPassArchitectureLint();
  });

  it('infrastructure/common-adapters MAY implement a port of its own outbound', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { x } from "../../outbound";',
    }).toPassArchitectureLint();
  });

  it('infrastructure/common-adapters may NOT reach core contracts', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { x } from "../../../../../../../../core/contracts/src/__identity-fixture__";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('infrastructure/common-adapters MAY reach a sibling adapter of its own module', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/spec/__fixture__.ts',
      code: 'import { x } from "..";',
    }).toPassArchitectureLint();
  });

  it('infrastructure/common-adapters may NOT reach the core adapters of another module', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/audit/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { x } from "../../../auth/infrastructure/common-adapters";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('infrastructure/common-adapters may NOT reach entities', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { x } from "../../../../../../../../core/entities/src";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('infrastructure/common-adapters may NOT mount a common module', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
      code: 'import { x } from "../../../../../common/modules/identity";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the rest of infrastructure MAY reach entities, app contracts and its own adapters', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      code:
        'import { x } from "../../../../../../../../core/entities/src";\n' +
        'import { y } from "../../../../../contracts/auth";\n' +
        'import { z } from "../common-adapters";',
    }).toPassArchitectureLint();
  });

  it('the rest of infrastructure may NOT reach core contracts', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      code: 'import { x } from "../../../../../../../../core/contracts/src/__identity-fixture__";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the module root MAY reach its own application and outbound', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../application";\nimport { y } from "../outbound";',
    }).toPassArchitectureLint();
  });

  it('application MAY reach its own outbound and @nestjs/common', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/application/use-cases/__fixture__.ts',
      code: 'import { x } from "../../outbound";\nimport { Inject } from "@nestjs/common";',
    }).toPassArchitectureLint();
  });

  it.each([
    '../../infrastructure',
    '../../../../../../../../core/entities/src',
    'typeorm',
    '../../../../../contracts/auth',
  ])('application may NOT reach %s', async (source) => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/application/use-cases/__fixture__.ts',
      code: `import { x } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each(['../application', '@nestjs/common'])('outbound may NOT reach %s', async (source) => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/outbound/__fixture__.ts',
      code: `import { x } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    '@nestjs-cls/transactional',
    '@nestjs-cls/transactional-adapter-typeorm',
    '@nestjs/typeorm',
    'typeorm',
  ])('the rest of infrastructure MAY import the persistence package %s', async (source) => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      code: `import { x } from "${source}";`,
    }).toPassArchitectureLint();
  });

  it('the rest of infrastructure MAY reach its own outbound', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      code: 'import { x } from "../../outbound";',
    }).toPassArchitectureLint();
  });

  it('another global module may NOT reach auth infrastructure', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/audit/infrastructure/__fixture__.ts',
      code: 'import { x } from "../../auth/infrastructure";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    [
      'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      '../../../../../../../libs/contracts/src',
    ],
    [
      'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
      '../../../../../../../../libs/contracts/src',
    ],
  ])('%s MAY reach the lib contracts of its own name', async (file, contracts) => {
    await expect({ file, code: `import { x } from "${contracts}/auth";` }).toPassArchitectureLint();
  });

  it.each([
    [
      'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      '../../../../../../../libs/contracts/src',
    ],
    [
      'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
      '../../../../../../../../libs/contracts/src',
    ],
    [
      'apps/__global-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      '../../../../../../../../libs/contracts/src',
    ],
  ])('%s may NOT reach lib contracts of another name', async (file, contracts) => {
    await expect({ file, code: `import { x } from "${contracts}/cache";` }).toBreakRule(
      'boundaries/dependencies',
    );
  });

  it.each([
    'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
    'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
  ])('%s MAY import @nestjs/common', async (file) => {
    await expect({
      file,
      code: 'import { Injectable } from "@nestjs/common";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
    'apps/__global-fixture__/src/app/global/auth/infrastructure/common-adapters/__fixture__.ts',
  ])('%s may NOT import @nestjs/jwt — the auth lib verifies tokens', async (file) => {
    await expect({
      file,
      code: 'import { JwtService } from "@nestjs/jwt";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a feature may NOT reach the global modules', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/features/product/__fixture__.ts',
      code: 'import { x } from "../../app/global";',
    }).toBreakRule('boundaries/dependencies');
  });
});
