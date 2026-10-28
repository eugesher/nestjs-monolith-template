import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('common modules (common/modules/<module>)', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__common-fixture__/src/common/modules/idempotency/index.ts',
      'apps/__common-fixture__/src/common/modules/idempotency/module/idempotency.module.ts',
      'apps/__common-fixture__/src/common/modules/idempotency/application/index.ts',
      'apps/__common-fixture__/src/common/modules/idempotency/outbound/index.ts',
      'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/index.ts',
      'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/core-adapters/index.ts',
      'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/common-adapters/index.ts',
      'apps/__common-fixture__/src/common/modules/audit/index.ts',
      'apps/__common-fixture__/src/common/modules/audit/application/index.ts',
      'apps/__common-fixture__/src/common/modules/audit/outbound/index.ts',
      'apps/__common-fixture__/src/common/shared/concurrency/index.ts',
      'apps/__common-fixture__/src/contracts/idempotency/index.ts',
      'apps/__common-fixture__/src/contracts/audit/index.ts',
      'apps/__common-fixture__/src/features/item/item.module.ts',
      'apps/__common-fixture__/src/features/item/infrastructure/common-adapters/index.ts',
      'apps/__common-fixture__/src/app/global/index.ts',
      'core/modules/src/__ledger-fixture__/index.ts',
      'core/contracts/src/__ledger-fixture__/index.ts',
      'core/entities/src/index.ts',
      'libs/cache/src/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  describe('layers', () => {
    it('a common module MAY reach its own contracts', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/idempotency";',
      }).toPassArchitectureLint();
    });

    it('common application may NOT reach its own infrastructure', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
        code: 'import { x } from "../infrastructure";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each(['domain', 'outbound'])('common %s is framework-free', async (layer) => {
      await expect({
        file: `apps/__common-fixture__/src/common/modules/idempotency/${layer}/__fixture__.ts`,
        code: 'import { Injectable } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('common infrastructure MAY reach core entities', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../../../../../../../core/entities/src";',
      }).toPassArchitectureLint();
    });

    it('common infrastructure MAY reach its own core-adapters and common-adapters', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../core-adapters";\nimport { y } from "../common-adapters";',
      }).toPassArchitectureLint();
    });

    it.each(['../../../../features/item/item.module', '../../../../app/global'])(
      'a common module may NOT reach the app: %s',
      async (source) => {
        await expect({
          file: 'apps/__common-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
          code: `import { x } from "${source}";`,
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('common modules have no presentation/ folder', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/presentation/__fixture__.ts',
        code: 'export const orphan = 1;',
      }).toBreakRule('boundaries/no-unknown-files');
    });
  });

  describe('core from a common module', () => {
    it('the common module root MAY import a core module to wire it', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/modules/src/__ledger-fixture__";',
      }).toPassArchitectureLint();
    });

    it('the common module root may NOT reach core contracts', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/contracts/src/__ledger-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each([
      ['application', '../../../../../../../core/modules/src/__ledger-fixture__'],
      ['infrastructure/persistence', '../../../../../../../../core/modules/src/__ledger-fixture__'],
      [
        'infrastructure/core-adapters',
        '../../../../../../../../core/modules/src/__ledger-fixture__',
      ],
    ])('common %s may NOT import a core module', async (folder, source) => {
      await expect({
        file: `apps/__common-fixture__/src/common/modules/idempotency/${folder}/__fixture__.ts`,
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });

    it('common infrastructure/core-adapters MAY reach core contracts and their own outbound', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/core-adapters/__fixture__.ts',
        code:
          'import { x } from "../../../../../../../../core/contracts/src/__ledger-fixture__";\n' +
          'import { y } from "../../outbound";',
      }).toPassArchitectureLint();
    });

    it('common infrastructure/core-adapters may NOT reach the outbound of another common module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { x } from "../../../audit/outbound";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('common infrastructure outside core-adapters may NOT reach core contracts', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../../../../../../../core/contracts/src/__ledger-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('other common modules and shared code', () => {
    it('the common module root MAY import a shared barrel', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        code: 'import { x } from "../../../shared/concurrency";',
      }).toPassArchitectureLint();
    });

    it.each([
      ['application', '../../../shared/concurrency'],
      ['infrastructure/persistence', '../../../../shared/concurrency'],
    ])('common %s may NOT reach a shared barrel', async (folder, source) => {
      await expect({
        file: `apps/__common-fixture__/src/common/modules/idempotency/${folder}/__fixture__.ts`,
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });

    it('common infrastructure/common-adapters MAY reach the contracts of another common module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../../contracts/audit";',
      }).toPassArchitectureLint();
    });

    it.each([
      '../../../../../../../../core/contracts/src/__ledger-fixture__',
      '../../../../../../../../core/entities/src',
    ])(
      'common infrastructure/common-adapters may NOT reach %s — it talks to the other module, not to core or its tables',
      async (source) => {
        await expect({
          file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/common-adapters/__fixture__.ts',
          code: `import { x } from "${source}";`,
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it('common infrastructure outside common-adapters may NOT reach the contracts of another module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../../../../contracts/audit";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the common module root MAY import another common module to wire it', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        code: 'import { x } from "../../audit";',
      }).toPassArchitectureLint();
    });

    it.each([
      ['application', '../../audit'],
      ['infrastructure/persistence', '../../../audit'],
      ['infrastructure/common-adapters', '../../../audit'],
    ])('common %s may NOT import another common module', async (folder, source) => {
      await expect({
        file: `apps/__common-fixture__/src/common/modules/idempotency/${folder}/__fixture__.ts`,
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });

    it('a common module may NOT reach the contracts of another common module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/audit";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a common module may NOT reach a layer of another common module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
        code: 'import { x } from "../../audit/application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('common/shared may NOT reach a common module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/shared/concurrency/__fixture__.ts',
        code: 'import { x } from "../../modules/idempotency";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('app contracts may NOT reach common modules', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/contracts/idempotency/__fixture__.ts',
        code: 'import { x } from "../../common/modules/idempotency";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('the module barrel and module/', () => {
    it('the common module barrel MAY export the nest module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/index.ts',
        code: 'export * from "./module/idempotency.module";',
      }).toPassArchitectureLint();
    });

    it('the common module barrel may NOT export anything else', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/index.ts',
        code: 'export * from "./application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a common module may NOT declare HTTP controllers', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        code: 'import { Controller } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a facade MAY reach the application layer and its own contracts', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/idempotency-common.facade.ts',
        code: 'import { x } from "../application";\nimport { y } from "../../../../contracts/idempotency";',
      }).toPassArchitectureLint();
    });

    it.each([
      '../infrastructure',
      '../../../../../../../core/entities/src',
      '../../../../../../../libs/cache/src',
    ])('a facade may NOT reach %s', async (source) => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/idempotency-common.facade.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });

    it('a facade may NOT import the HTTP platform', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/idempotency-common.facade.ts',
        code: 'import { x } from "@nestjs/platform-express";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('any other file in module/ is the composition root and MAY reach infrastructure', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        code: 'import { x } from "../infrastructure";',
      }).toPassArchitectureLint();
    });

    it('the composition root may NOT import entities — it wires them through infrastructure', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('app → common modules', () => {
    it('infrastructure/common-adapters MAY reach app contracts', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/features/item/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/idempotency";',
      }).toPassArchitectureLint();
    });

    it('the rest of infrastructure MAY reach its common-adapters', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../common-adapters";',
      }).toPassArchitectureLint();
    });

    it.each([
      [
        'apps/__common-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
        '../../../../contracts/idempotency',
      ],
      [
        'apps/__common-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        '../../../../contracts/idempotency',
      ],
      [
        'apps/__common-fixture__/src/features/item/outbound/ports/__fixture__.ts',
        '../../../../contracts/idempotency',
      ],
      ['apps/__common-fixture__/src/app/__fixture__.ts', '../contracts/idempotency'],
    ])('%s may NOT reach app contracts', async (file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });

    it('infrastructure/common-adapters may NOT reach core entities — it talks to the common module, not its tables', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/features/item/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('presentation may NOT reach app contracts — common modules are reached through common-adapters', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/idempotency";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('an e2e spec MAY reach app contracts', async () => {
      await expect({
        file: 'apps/__common-fixture__/test/app/__fixture__.e2e-spec.ts',
        code: 'import { x } from "../../src/contracts/idempotency";',
      }).toPassArchitectureLint();
    });

    it.each([
      [
        'apps/__common-fixture__/src/features/item/__fixture__.ts',
        '../../common/modules/idempotency',
      ],
      [
        'apps/__common-fixture__/src/app/global/auth/module/__fixture__.ts',
        '../../../../common/modules/idempotency',
      ],
    ])('the module root %s MAY mount a common module', async (file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toPassArchitectureLint();
    });

    it.each([
      [
        'apps/__common-fixture__/src/features/item/infrastructure/common-adapters/__fixture__.ts',
        '../../../../common/modules/idempotency',
      ],
      [
        'apps/__common-fixture__/src/features/item/application/use-cases/__fixture__.ts',
        '../../../../common/modules/idempotency',
      ],
      ['apps/__common-fixture__/src/app/__fixture__.ts', '../common/modules/idempotency'],
      [
        'apps/__common-fixture__/test/app/__fixture__.e2e-spec.ts',
        '../../src/common/modules/idempotency',
      ],
    ])('%s may NOT mount a common module', async (file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });

    it('an app may NOT take a deep path into a common module', async () => {
      await expect({
        file: 'apps/__common-fixture__/src/features/item/__fixture__.ts',
        code: 'import { x } from "../../common/modules/idempotency/application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each([
      [
        'apps/__common-other-fixture__/src/features/health/presentation/controllers/__fixture__.ts',
        '../../../../../../__common-fixture__/src/contracts/idempotency',
      ],
      [
        'apps/__common-other-fixture__/src/features/health/infrastructure/common-adapters/__fixture__.ts',
        '../../../../../../__common-fixture__/src/contracts/idempotency',
      ],
      [
        'apps/__common-other-fixture__/src/features/health/__fixture__.ts',
        '../../../../__common-fixture__/src/common/modules/idempotency',
      ],
      [
        'apps/__common-other-fixture__/test/app/__fixture__.e2e-spec.ts',
        '../../../__common-fixture__/src/contracts/idempotency',
      ],
    ])('another app (%s) may NOT reach %s', async (file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    });
  });
});
