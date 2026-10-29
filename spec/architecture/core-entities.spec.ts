import '../support/lint';

describe('core entities (@acme-core/entities)', () => {
  it('@acme-core/entities resolves', () => {
    expect('@acme-core/entities').toResolve();
  });

  it('a deep path into the entities does not resolve', () => {
    expect('@acme-core/entities/item/item.entity').not.toResolve();
  });

  it.each([
    'apps/staff-app/src/app/setup/orm/entities/index.ts',
    'apps/customer-app/src/features/item/infrastructure/persistence/repositories/__fixture__.ts',
    'apps/customer-app/src/common/modules/idempotency/infrastructure/persistence/repositories/__fixture__.ts',
    'apps/customer-app/src/processors/purge/infrastructure/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/infrastructure/persistence/__fixture__.ts',
  ])('%s MAY import the entities', async (file) => {
    await expect({
      file,
      code: 'import { Item } from "@acme-core/entities";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/customer-app/src/features/item/domain/__fixture__.ts',
    'apps/customer-app/src/features/item/outbound/__fixture__.ts',
    'apps/customer-app/src/features/item/application/use-cases/__fixture__.ts',
    'apps/customer-app/src/features/item/presentation/controllers/__fixture__.ts',
    'apps/customer-app/src/features/item/item.module.ts',
    'apps/customer-app/src/processors/purge/application/__fixture__.ts',
    'apps/customer-app/src/common/shared/auth/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/domain/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
    'apps/customer-app/src/main.ts',
  ])(
    '%s may NOT import the entities, a table is reached only through a repository',
    async (file) => {
      await expect({
        file,
        code: 'import { Item } from "@acme-core/entities";',
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it('an entity MAY import typeorm and the kernel lib', async () => {
    await expect({
      file: 'core/entities/src/item/__fixture__.ts',
      code: 'import { Entity } from "typeorm";\nimport { ItemStatusEnum } from "@acme-libs/kernel";',
    }).toPassArchitectureLint();
  });

  it.each(['@nestjs/swagger', 'class-validator', '@nestjs/common'])(
    'an entity may NOT import %s — a table carries no API or validation metadata',
    async (source) => {
      await expect({
        file: 'core/entities/src/item/__fixture__.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );
});
