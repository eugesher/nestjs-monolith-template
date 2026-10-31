import '../support/lint';

describe('e2e sections', () => {
  it('an e2e section follows the spec rules and MAY pass an awaited call to another call', async () => {
    await expect({
      file: 'apps/staff-app/test/features/__fixture__.e2e.ts',
      code:
        'declare const find: () => Promise<number>;' +
        'declare const save: (value: number) => void;' +
        'export const run = async () => save(await find());',
    }).toPassArchitectureLint();
  });

  it.each([
    '@nestjs/common',
    '@nestjs/config',
    '@nestjs/jwt',
    '@nestjs/testing',
    'ioredis',
    'nestjs-pino',
    'supertest',
    'typeorm',
  ])('the e2e code MAY import %s', async (source) => {
    await expect({
      file: 'apps/customer-app/test/context/__fixture__.ts',
      code: `import * as x from "${source}";`,
    }).toPassArchitectureLint();
  });

  it.each(['argon2', '@nestjs/core', '@nestjs/typeorm'])(
    'the e2e code may NOT import %s',
    async (source) => {
      await expect({
        file: 'apps/customer-app/test/context/__fixture__.ts',
        code: `import * as x from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it('the e2e context MAY use the test entry points of libs', async () => {
    await expect({
      file: 'apps/customer-app/test/context/__fixture__.ts',
      code: 'import { REDIS_CLIENT } from "@acme-libs/cache/testing";',
    }).toPassArchitectureLint();
  });

  it.each(['ledger', 'product-stock'])(
    'the e2e context MAY read the queue contract of the core module %s',
    async (module) => {
      await expect({
        file: 'apps/processor-app/test/context/__fixture__.ts',
        code: `import { x } from "@acme-core/contracts/${module}";`,
      }).toPassArchitectureLint();
    },
  );

  it('the e2e context may NOT read the contracts of a core module without a queue', async () => {
    await expect({
      file: 'apps/processor-app/test/context/__fixture__.ts',
      code: 'import { x } from "@acme-core/contracts/idempotency";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('an e2e spec MAY read the entities of core', async () => {
    await expect({
      file: 'apps/staff-app/test/app/__fixture__.e2e-spec.ts',
      code: 'import * as entities from "@acme-core/entities";',
    }).toPassArchitectureLint();
  });

  it('an e2e spec MAY mount the e2e sections and the context of its app', async () => {
    await expect({
      file: 'apps/staff-app/test/app/__fixture__.e2e-spec.ts',
      code:
        'import { HealthE2E } from "../features";' +
        'import { AppE2EContext } from "../context/app-e2e.context";',
    }).toPassArchitectureLint();
  });

  it('an e2e spec may NOT mount the e2e sections of another app', async () => {
    await expect({
      file: 'apps/customer-app/test/app/__fixture__.e2e-spec.ts',
      code: 'import { HealthE2E } from "../../../staff-app/test/features";',
    }).toBreakRule('boundaries/dependencies');
  });
});
