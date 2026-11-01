import '../support/lint';

describe('app entities (@acme-<app>/common/entities)', () => {
  it('@acme-staff/common/entities resolves', () => {
    expect('@acme-staff/common/entities').toResolve();
  });

  it('a repository may NOT reach a deep path into the entities of its app', async () => {
    await expect({
      file: 'apps/staff-app/src/features/product/infrastructure/persistence/repositories/__fixture__.ts',
      code: 'import { Note } from "@acme-staff/common/entities/note/note.entity";',
    }).toBreakRule('no-restricted-imports');
  });

  it.each([
    'apps/staff-app/src/app/setup/orm/entities/index.ts',
    'apps/staff-app/src/app/global/auth/infrastructure/persistence/repositories/__fixture__.ts',
    'apps/staff-app/src/features/product/infrastructure/persistence/repositories/__fixture__.ts',
    'apps/staff-app/src/common/modules/idempotency/infrastructure/persistence/repositories/__fixture__.ts',
  ])('%s MAY import the entities of its app', async (file) => {
    await expect({
      file,
      code: 'import { Note } from "@acme-staff/common/entities";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/staff-app/src/features/product/domain/__fixture__.ts',
    'apps/staff-app/src/features/product/outbound/__fixture__.ts',
    'apps/staff-app/src/features/product/application/use-cases/__fixture__.ts',
    'apps/staff-app/src/features/product/presentation/controllers/__fixture__.ts',
    'apps/staff-app/src/features/product/product.module.ts',
    'apps/staff-app/src/common/shared/auth/__fixture__.ts',
    'apps/staff-app/src/main.ts',
  ])(
    '%s may NOT import the entities of its app, a table is reached only through a repository',
    async (file) => {
      await expect({
        file,
        code: 'import { Note } from "@acme-staff/common/entities";',
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it.each([
    'apps/customer-app/src/features/order/infrastructure/persistence/repositories/__fixture__.ts',
    'apps/processor-app/src/processors/purge/infrastructure/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/infrastructure/persistence/__fixture__.ts',
  ])('%s may NOT import the entities of staff-app', async (file) => {
    await expect({
      file,
      code: 'import { Note } from "@acme-staff/common/entities";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('an app entity MAY import typeorm, the kernel lib, the core entities and its siblings', async () => {
    await expect({
      file: 'apps/staff-app/src/common/entities/note/__fixture__.ts',
      code:
        'import { Entity } from "typeorm";\n' +
        'import { ReminderStatusEnum } from "@acme-libs/kernel";\n' +
        'import { Product } from "@acme-core/entities";\n' +
        'import { StaffUser } from "../staff-identity/staff-user.entity";',
    }).toPassArchitectureLint();
  });

  it.each([
    '@nestjs/common',
    'class-validator',
    '@acme-libs/toolkit',
    '@acme-staff/contracts/auth',
  ])(
    'an app entity may NOT import %s — a table carries no framework or module code',
    async (source) => {
      await expect({
        file: 'apps/staff-app/src/common/entities/note/__fixture__.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );
});
