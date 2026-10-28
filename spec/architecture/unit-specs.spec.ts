import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('unit specs', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__specs-fixture__/src/features/item/infrastructure/core-adapters/item-ledger-core.adapter.ts',
      'apps/__specs-fixture__/src/features/item/infrastructure/common-adapters/item-idempotency-common.adapter.ts',
      'apps/__specs-fixture__/src/processors/catalog-events/infrastructure/core-adapters/catalog-events-ledger-core.adapter.ts',
      'apps/__specs-fixture__/src/processors/catalog-events/infrastructure/common-adapters/catalog-events-idempotency-common.adapter.ts',
      'apps/__specs-fixture__/src/common/modules/idempotency/infrastructure/core-adapters/idempotency-common-identity-core.adapter.ts',
      'apps/__specs-fixture__/src/common/modules/idempotency/infrastructure/common-adapters/idempotency-common-audit-common.adapter.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  it.each([
    [
      'apps/__specs-fixture__/src/features/item/infrastructure/core-adapters',
      'item-ledger-core.adapter',
    ],
    [
      'apps/__specs-fixture__/src/features/item/infrastructure/common-adapters',
      'item-idempotency-common.adapter',
    ],
    [
      'apps/__specs-fixture__/src/processors/catalog-events/infrastructure/core-adapters',
      'catalog-events-ledger-core.adapter',
    ],
    [
      'apps/__specs-fixture__/src/processors/catalog-events/infrastructure/common-adapters',
      'catalog-events-idempotency-common.adapter',
    ],
    [
      'apps/__specs-fixture__/src/common/modules/idempotency/infrastructure/core-adapters',
      'idempotency-common-identity-core.adapter',
    ],
    [
      'apps/__specs-fixture__/src/common/modules/idempotency/infrastructure/common-adapters',
      'idempotency-common-audit-common.adapter',
    ],
  ])('a spec in %s/spec MAY import its adapter %s', async (folder, adapter) => {
    await expect({
      file: `${folder}/spec/__fixture__.spec.ts`,
      code: `import { x } from "../${adapter}";`,
    }).toPassArchitectureLint();
  });

  it.each([
    [
      'apps/__specs-fixture__/src/features/item/infrastructure/core-adapters',
      'item-ledger-core.adapter',
    ],
    [
      'apps/__specs-fixture__/src/features/item/infrastructure/common-adapters',
      'item-idempotency-common.adapter',
    ],
    [
      'apps/__specs-fixture__/src/processors/catalog-events/infrastructure/core-adapters',
      'catalog-events-ledger-core.adapter',
    ],
    [
      'apps/__specs-fixture__/src/processors/catalog-events/infrastructure/common-adapters',
      'catalog-events-idempotency-common.adapter',
    ],
    [
      'apps/__specs-fixture__/src/common/modules/idempotency/infrastructure/core-adapters',
      'idempotency-common-identity-core.adapter',
    ],
    [
      'apps/__specs-fixture__/src/common/modules/idempotency/infrastructure/common-adapters',
      'idempotency-common-audit-common.adapter',
    ],
  ])(
    'another adapter in %s may NOT import %s — adapters do not share code',
    async (folder, adapter) => {
      await expect({
        file: `${folder}/__fixture__.ts`,
        code: `import { x } from "./${adapter}";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );
});
