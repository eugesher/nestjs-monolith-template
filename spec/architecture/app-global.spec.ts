import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('global modules (app/global) — modules without controllers', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__global-fixture__/src/app/global/index.ts',
      'apps/__global-fixture__/src/app/global/auth/module/auth.module.ts',
      'apps/__global-fixture__/src/app/global/auth/infrastructure/index.ts',
      'apps/__global-fixture__/src/app/global/auth/infrastructure/core-adapters/index.ts',
      'apps/__global-fixture__/src/contracts/auth/index.ts',
      'apps/__global-fixture__/src/contracts/audit/index.ts',
      'apps/__global-fixture__/src/features/item/item.module.ts',
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

  it('the module root MAY mount a core module', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      code: 'import { x } from "../../../../../../../core/modules/src/__identity-fixture__";',
    }).toPassArchitectureLint();
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

  it.each([
    [
      'apps/__global-fixture__/src/app/global/auth/module/__fixture__.ts',
      '../../../../contracts/audit',
    ],
    [
      'apps/__global-fixture__/src/app/global/auth/infrastructure/core-adapters/__fixture__.ts',
      '../../../../../contracts/audit',
    ],
  ])('%s may NOT reach app contracts of another name', async (file, source) => {
    await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
      'boundaries/dependencies',
    );
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
      code: 'import { x } from "../../../../features/item/item.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('infrastructure/core-adapters MAY reach core contracts and app contracts', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/core-adapters/__fixture__.ts',
      code:
        'import { x } from "../../../../../../../../core/contracts/src/__identity-fixture__";\n' +
        'import { y } from "../../../../../contracts/auth";',
    }).toPassArchitectureLint();
  });

  it('infrastructure/core-adapters may NOT reach entities', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/core-adapters/__fixture__.ts',
      code: 'import { x } from "../../../../../../../../core/entities/src";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('infrastructure/core-adapters may NOT mount a core module', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/core-adapters/__fixture__.ts',
      code: 'import { x } from "../../../../../../../../core/modules/src/__identity-fixture__";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the rest of infrastructure MAY reach entities, app contracts and its own adapters', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      code:
        'import { x } from "../../../../../../../../core/entities/src";\n' +
        'import { y } from "../../../../../contracts/auth";\n' +
        'import { z } from "../core-adapters";',
    }).toPassArchitectureLint();
  });

  it('the rest of infrastructure may NOT reach core contracts', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      code: 'import { x } from "../../../../../../../../core/contracts/src/__identity-fixture__";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('another global module may NOT reach auth infrastructure', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/app/global/audit/infrastructure/__fixture__.ts',
      code: 'import { x } from "../../auth/infrastructure";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a feature may NOT reach the global modules', async () => {
    await expect({
      file: 'apps/__global-fixture__/src/features/item/__fixture__.ts',
      code: 'import { x } from "../../app/global";',
    }).toBreakRule('boundaries/dependencies');
  });
});
