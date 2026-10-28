import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('libs by layer', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'libs/auth/src/index.ts',
      'libs/cache/src/index.ts',
      'libs/config/src/index.ts',
      'libs/database/src/index.ts',
      'libs/health/src/index.ts',
      'libs/http/src/index.ts',
      'libs/kernel/src/index.ts',
      'libs/messaging/src/index.ts',
      'libs/observability/src/index.ts',
      'libs/openapi/src/index.ts',
      'libs/toolkit/src/index.ts',
      'libs/contracts/src/cache/index.ts',
      'libs/contracts/src/database/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  it.each([
    ['apps/__layers-fixture__/src/features/item/domain/__fixture__.ts', '../../../../../../libs'],
    ['apps/__layers-fixture__/src/features/item/outbound/__fixture__.ts', '../../../../../../libs'],
    ['apps/__layers-fixture__/src/contracts/audit/__fixture__.ts', '../../../../../libs'],
    ['core/modules/src/__ledger-fixture__/domain/__fixture__.ts', '../../../../../libs'],
    ['core/modules/src/__ledger-fixture__/outbound/__fixture__.ts', '../../../../../libs'],
    ['core/contracts/src/__ledger-fixture__/__fixture__.ts', '../../../../libs'],
  ])('%s may reach only the framework-free libs', async (file, libs) => {
    const others = [
      'auth',
      'cache',
      'config',
      'database',
      'health',
      'http',
      'messaging',
      'observability',
      'openapi',
    ];

    await expect({
      file,
      code: `import { x } from "${libs}/kernel/src";\nimport { y } from "${libs}/toolkit/src";`,
    }).toPassArchitectureLint();

    for (const lib of others) {
      await expect({
        file,
        code: `import { x } from "${libs}/${lib}/src";`,
      }).toBreakRule('boundaries/dependencies');
    }
  });

  it('main may reach only the libs that run before or outside DI', async () => {
    const allowed = ['database', 'kernel', 'observability', 'openapi'];
    const libs = [
      'auth',
      'cache',
      'config',
      'database',
      'health',
      'http',
      'kernel',
      'messaging',
      'observability',
      'openapi',
      'toolkit',
    ];

    for (const lib of libs) {
      if (allowed.includes(lib)) {
        await expect({
          file: 'apps/__layers-fixture__/src/main.ts',
          code: `import { x } from "../../../libs/${lib}/src";`,
        }).toPassArchitectureLint();
      } else {
        await expect({
          file: 'apps/__layers-fixture__/src/main.ts',
          code: `import { x } from "../../../libs/${lib}/src";`,
        }).toBreakRule('boundaries/dependencies');
      }
    }
  });

  it('presentation MAY reach the HTTP lib', async () => {
    await expect({
      file: 'apps/__layers-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
      code: 'import { x } from "../../../../../../../libs/http/src";',
    }).toPassArchitectureLint();
  });

  it('application may NOT reach the HTTP lib', async () => {
    await expect({
      file: 'apps/__layers-fixture__/src/features/item/application/use-cases/__fixture__.ts',
      code: 'import { x } from "../../../../../../../libs/http/src";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    [
      'apps/__layers-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
      '../../../../../../../libs',
    ],
    [
      'apps/__layers-fixture__/src/processors/purge/infrastructure/persistence/__fixture__.ts',
      '../../../../../../../libs',
    ],
    [
      'apps/__layers-fixture__/src/common/modules/idempotency/infrastructure/persistence/__fixture__.ts',
      '../../../../../../../../libs',
    ],
    [
      'apps/__layers-fixture__/src/app/global/auth/infrastructure/persistence/__fixture__.ts',
      '../../../../../../../../libs',
    ],
    [
      'core/modules/src/__ledger-fixture__/infrastructure/persistence/__fixture__.ts',
      '../../../../../../libs',
    ],
    ['apps/__layers-fixture__/src/app/setup/orm/__fixture__.ts', '../../../../../../libs'],
    ['apps/__layers-fixture__/src/main.ts', '../../../libs'],
  ])('infrastructure and bootstrap MAY reach the database lib: %s', async (file, libs) => {
    await expect({
      file,
      code: `import { x } from "${libs}/database/src";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/__layers-fixture__/src/features/item/domain/__fixture__.ts', '../../../../../../libs'],
    [
      'apps/__layers-fixture__/src/features/item/application/use-cases/__fixture__.ts',
      '../../../../../../../libs',
    ],
    [
      'apps/__layers-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
      '../../../../../../../libs',
    ],
    ['apps/__layers-fixture__/src/features/item/__fixture__.ts', '../../../../../libs'],
    ['core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts', '../../../../../libs'],
  ])('nothing else may reach the database lib: %s', async (file, libs) => {
    await expect({
      file,
      code: `import { x } from "${libs}/database/src";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    [
      'apps/__layers-fixture__/src/features/item/application/use-cases/__fixture__.ts',
      '../../../../../../../libs',
    ],
    [
      'apps/__layers-fixture__/src/processors/purge/application/services/__fixture__.ts',
      '../../../../../../../libs',
    ],
    [
      'apps/__layers-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
      '../../../../../../../libs',
    ],
    ['core/modules/src/__ledger-fixture__/application/__fixture__.ts', '../../../../../libs'],
  ])('%s MAY reach the transaction port in the database contracts', async (file, libs) => {
    await expect({
      file,
      code: `import { x } from "${libs}/contracts/src/database";`,
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/__layers-fixture__/src/features/item/domain/__fixture__.ts', '../../../../../../libs'],
    ['apps/__layers-fixture__/src/features/item/outbound/__fixture__.ts', '../../../../../../libs'],
    [
      'apps/__layers-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
      '../../../../../../../libs',
    ],
    ['core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts', '../../../../../libs'],
  ])(
    '%s may NOT reach the database contracts, transactions are run by the application',
    async (file, libs) => {
      await expect({
        file,
        code: `import { x } from "${libs}/contracts/src/database";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it.each([
    [
      'apps/__layers-fixture__/src/features/item/application/use-cases/__fixture__.ts',
      '../../../../../../../libs',
    ],
    ['core/modules/src/__ledger-fixture__/application/__fixture__.ts', '../../../../../libs'],
  ])(
    '%s may NOT reach the cache contracts, only the database contracts are open to the application',
    async (file, libs) => {
      await expect({
        file,
        code: `import { x } from "${libs}/contracts/src/cache";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it('infrastructure MAY reach the lib contracts it adapts', async () => {
    await expect({
      file: 'apps/__layers-fixture__/src/features/item/infrastructure/cache/__fixture__.ts',
      code: 'import { x } from "../../../../../../../libs/contracts/src/cache";',
    }).toPassArchitectureLint();
  });

  it.each([
    ['apps/__layers-fixture__/src/features/item/infrastructure/cache/__fixture__.ts', 'cache'],
    ['apps/__layers-fixture__/src/features/item/infrastructure/cache/__fixture__.ts', 'http'],
    ['apps/__layers-fixture__/src/features/item/infrastructure/cache/__fixture__.ts', 'config'],
    [
      'apps/__layers-fixture__/src/features/item/infrastructure/cache/__fixture__.ts',
      'observability',
    ],
  ])(
    '%s may NOT reach the %s lib root — adapters take the lib contracts, Nest modules are wired at the root',
    async (file, lib) => {
      await expect({
        file,
        code: `import { x } from "../../../../../../../libs/${lib}/src";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it.each([
    ['apps/__layers-fixture__/src/app/__fixture__.ts', '../../../../libs', 'cache'],
    ['apps/__layers-fixture__/src/app/__fixture__.ts', '../../../../libs', 'messaging'],
    ['apps/__layers-fixture__/src/features/item/__fixture__.ts', '../../../../../libs', 'auth'],
    ['apps/__layers-fixture__/src/features/item/__fixture__.ts', '../../../../../libs', 'health'],
    [
      'apps/__layers-fixture__/src/app/global/auth/module/__fixture__.ts',
      '../../../../../../../libs',
      'auth',
    ],
  ])(
    '%s MAY reach %s/%s, the Nest module of a lib is wired where it is used',
    async (file, libs, lib) => {
      await expect({
        file,
        code: `import { x } from "${libs}/${lib}/src";`,
      }).toPassArchitectureLint();
    },
  );

  it.each([
    ['core/modules/src/__ledger-fixture__/module/__fixture__.ts', '../../../../../libs', 'cache'],
    ['apps/__layers-fixture__/src/features/item/__fixture__.ts', '../../../../../libs', 'cache'],
    ['apps/__layers-fixture__/src/processors/purge/__fixture__.ts', '../../../../../libs', 'auth'],
  ])(
    'the module root %s may NOT reach %s/%s, it wires only the libs it uses',
    async (file, libs, lib) => {
      await expect({
        file,
        code: `import { x } from "${libs}/${lib}/src";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it.each([
    'apps/__layers-fixture__/src/features/item/__fixture__.ts',
    'apps/__layers-fixture__/src/processors/purge/__fixture__.ts',
    'apps/__layers-fixture__/src/common/modules/idempotency/module/__fixture__.ts',
    'apps/__layers-fixture__/src/app/global/auth/module/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
    'apps/__layers-fixture__/src/app/setup/config/__fixture__.ts',
  ])('%s MAY bind config values through the config lib', async (file) => {
    await expect({
      file,
      code: 'import { ConfigProviderHelper } from "@acme-libs/config";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/__layers-fixture__/src/features/item/domain/__fixture__.ts',
    'apps/__layers-fixture__/src/features/item/application/use-cases/__fixture__.ts',
    'apps/__layers-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
    'apps/__layers-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts',
  ])(
    '%s may NOT reach the config lib — values arrive through tokens bound at the module root',
    async (file) => {
      await expect({
        file,
        code: 'import { ConfigProviderHelper } from "@acme-libs/config";',
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it.each([
    'apps/__layers-fixture__/src/features/item/application/use-cases/__fixture__.ts',
    'apps/__layers-fixture__/src/features/item/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/module/__fixture__.ts',
  ])('%s may NOT read ConfigService directly', async (file) => {
    await expect({
      file,
      code: 'import { ConfigService } from "@nestjs/config";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('bootstrap MAY set up the config module with its own Joi schema', async () => {
    await expect({
      file: 'apps/__layers-fixture__/src/app/setup/config/__fixture__.ts',
      code: 'import { ConfigModule } from "@nestjs/config";\nimport Joi from "joi";',
    }).toPassArchitectureLint();
  });

  it('main MAY read the port from ConfigService', async () => {
    await expect({
      file: 'apps/__layers-fixture__/src/main.ts',
      code: 'import { ConfigService } from "@nestjs/config";',
    }).toPassArchitectureLint();
  });

  it('a feature may NOT import joi — validation of env is the app bootstrap job', async () => {
    await expect({
      file: 'apps/__layers-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
      code: 'import Joi from "joi";',
    }).toBreakRule('boundaries/dependencies');
  });

  it.each([
    'apps/__layers-fixture__/src/features/item/application/use-cases/__fixture__.ts',
    'apps/__layers-fixture__/src/processors/purge/application/services/__fixture__.ts',
    'apps/__layers-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/application/__fixture__.ts',
    'apps/__layers-fixture__/src/common/shared/auth/__fixture__.ts',
  ])('%s MAY log through nestjs-pino', async (file) => {
    await expect({
      file,
      code: 'import { InjectPinoLogger, PinoLogger } from "nestjs-pino";',
    }).toPassArchitectureLint();
  });

  it.each([
    'apps/__layers-fixture__/src/features/item/domain/__fixture__.ts',
    'apps/__layers-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
    'apps/__layers-fixture__/src/features/item/presentation/controllers/__fixture__.ts',
    'apps/__layers-fixture__/src/processors/purge/presentation/__fixture__.ts',
    'apps/__layers-fixture__/src/features/item/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/module/ledger-core.facade.ts',
  ])(
    '%s may NOT log through nestjs-pino — outcomes are logged by the application',
    async (file) => {
      await expect({
        file,
        code: 'import { PinoLogger } from "nestjs-pino";',
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it.each([
    'apps/__layers-fixture__/src/features/item/infrastructure/persistence/__fixture__.ts',
    'core/modules/src/__ledger-fixture__/infrastructure/persistence/__fixture__.ts',
  ])('%s may NOT reach the observability lib', async (file) => {
    await expect({
      file,
      code: 'import { CorrelationContextHelper } from "@acme-libs/observability";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a consumer MAY read the correlation context from the observability lib', async () => {
    await expect({
      file: 'apps/__layers-fixture__/src/processors/purge/presentation/__fixture__.ts',
      code: 'import { CorrelationContextHelper } from "@acme-libs/observability";',
    }).toPassArchitectureLint();
  });
});
