import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('app shared code (common/shared) — barrels and contracts', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__shared-fixture__/src/common/shared/auth/index.ts',
      'apps/__shared-fixture__/src/common/shared/auth/guards/auth-jwt.guard.ts',
      'apps/__shared-fixture__/src/contracts/auth/index.ts',
      'apps/__shared-fixture__/src/contracts/audit/index.ts',
      'libs/http/src/index.ts',
      'libs/kernel/src/index.ts',
      'libs/toolkit/src/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  it('a feature MAY reach common through its barrel', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
      code: 'import { x } from "../../../../common/shared/auth";',
    }).toPassArchitectureLint();
  });

  it('a feature may NOT take a deep path into common', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
      code: 'import { x } from "../../../../common/shared/auth/guards/auth-jwt.guard";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('bootstrap may NOT reach app contracts', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/app/__fixture__.ts',
      code: 'import { x } from "../contracts/auth";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('main may NOT reach common even through its barrel — request behaviour is registered in DI', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/main.ts',
      code: 'import { x } from "./common/shared/auth";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('main may NOT take a deep path into common', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/main.ts',
      code: 'import { x } from "./common/shared/auth/guards/auth-jwt.guard";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('common/shared MAY take @nestjs/common, for decorators and HTTP errors', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/common/shared/auth/guards/__fixture__.ts',
      code: 'import { BadRequestException, createParamDecorator } from "@nestjs/common";',
    }).toPassArchitectureLint();
  });

  it('common/shared may NOT take a package outside its allowlist', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/common/shared/auth/guards/__fixture__.ts',
      code: 'import { ApiHeader } from "@nestjs/swagger";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a common barrel may NOT re-export contracts', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/common/shared/auth/index.ts',
      code: 'export * from "../../../contracts/auth";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('common/shared/<x> MAY reach contracts/<x>', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/common/shared/auth/guards/__fixture__.ts',
      code: 'import { x } from "../../../../contracts/auth";',
    }).toPassArchitectureLint();
  });

  it('common/shared/<x> may NOT reach the contracts of another name', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/common/shared/auth/guards/__fixture__.ts',
      code: 'import { x } from "../../../../contracts/audit";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('contracts MAY reach contracts and the kernel and toolkit libs', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/contracts/auth/ports/__fixture__.ts',
      code:
        'import { x } from "..";\n' +
        'import { y } from "../../../../../../libs/kernel/src";\n' +
        'import { z } from "../../../../../../libs/toolkit/src";',
    }).toPassArchitectureLint();
  });

  it('contracts may NOT reach the rest of common', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/contracts/auth/ports/__fixture__.ts',
      code: 'import { x } from "../../../common/shared/auth/guards/auth-jwt.guard";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('contracts may NOT reach other libs', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/contracts/auth/ports/__fixture__.ts',
      code: 'import { x } from "../../../../../../libs/http/src";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('contracts may NOT import external packages', async () => {
    await expect({
      file: 'apps/__shared-fixture__/src/contracts/auth/ports/__fixture__.ts',
      code: 'import { x } from "@nestjs/common";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('another app may NOT reach this app common', async () => {
    await expect({
      file: 'apps/__shared-other-fixture__/src/features/health/presentation/controllers/__fixture__.ts',
      code: 'import { x } from "../../../../../../__shared-fixture__/src/common/shared/auth";',
    }).toBreakRule('boundaries/dependencies');
  });
});
