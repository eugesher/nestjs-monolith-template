import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('app → core', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__core-link-fixture__/src/app/global/index.ts',
      'apps/__core-link-fixture__/src/features/product/product.module.ts',
      'core/modules/src/__ledger-fixture__/index.ts',
      'core/modules/src/__ledger-fixture__/application/index.ts',
      'core/contracts/src/__ledger-fixture__/index.ts',
      'core/entities/src/index.ts',
      'libs/contracts/src/health/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  describe('features', () => {
    it('infrastructure/core-adapters MAY reach core contracts', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/features/product/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/contracts/src/__ledger-fixture__";',
      }).toPassArchitectureLint();
    });

    it.each([
      'apps/__core-link-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
      'apps/__core-link-fixture__/src/features/product/application/use-cases/__fixture__.ts',
      'apps/__core-link-fixture__/src/features/product/presentation/controllers/__fixture__.ts',
    ])('%s may NOT reach core contracts — only core-adapters do', async (file) => {
      await expect({
        file,
        code: 'import { x } from "../../../../../../../core/contracts/src/__ledger-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure/core-adapters may NOT reach entities — it talks to the core module, not its tables', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/features/product/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('presentation MAY reach the health lib contracts (presentation-only modules like health)', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/features/product/presentation/controllers/__fixture__.ts',
        code: 'import { x } from "../../../../../../../libs/contracts/src/health";',
      }).toPassArchitectureLint();
    });

    it('the module root MAY mount a core module', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "../../../../../core/modules/src/__ledger-fixture__";',
      }).toPassArchitectureLint();
    });

    it('infrastructure/core-adapters may NOT mount a core module', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/features/product/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/modules/src/__ledger-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure MAY reach entities', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/features/product/infrastructure/persistence/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/entities/src";',
      }).toPassArchitectureLint();
    });

    it('an app may NOT take a deep path into a core module', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "../../../../../core/modules/src/__ledger-fixture__/application";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('bootstrap', () => {
    it('bootstrap may NOT mount a core module', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/app/__fixture__.ts',
        code: 'import { x } from "../../../../core/modules/src/__ledger-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('bootstrap MAY reach entities', async () => {
      await expect({
        file: 'apps/__core-link-fixture__/src/app/__fixture__.ts',
        code: 'import { x } from "../../../../core/entities/src";',
      }).toPassArchitectureLint();
    });
  });

  describe('app shared code (common/shared) → core', () => {
    it.each([
      '../../../../../../core/entities/src',
      '../../../../../../core/contracts/src/__ledger-fixture__',
      '../../../../../../core/modules/src/__ledger-fixture__',
      '../../../features/product/product.module',
      '../../../app/global',
    ])('common may NOT reach %s', async (source) => {
      await expect({
        file: 'apps/__core-link-fixture__/src/common/shared/auth/__fixture__.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });
  });
});
