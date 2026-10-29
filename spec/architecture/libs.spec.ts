import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('libs', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'libs/auth/src/index.ts',
      'libs/cache/src/index.ts',
      'libs/config/src/index.ts',
      'libs/credentials/src/index.ts',
      'libs/database/src/index.ts',
      'libs/health/src/index.ts',
      'libs/http/src/index.ts',
      'libs/http/src/exceptions/unauthorized-http.exception.ts',
      'libs/kernel/src/index.ts',
      'libs/observability/src/index.ts',
      'libs/openapi/src/index.ts',
      'libs/toolkit/src/index.ts',
      'libs/contracts/src/auth/index.ts',
      'libs/contracts/src/cache/index.ts',
      'libs/contracts/src/credentials/index.ts',
      'libs/contracts/src/database/index.ts',
      'libs/contracts/src/health/index.ts',
      'core/modules/src/__ledger-fixture__/index.ts',
      'apps/__libs-fixture__/src/features/product/product.module.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  it('a lib may NOT reach core', async () => {
    await expect({
      file: 'libs/observability/src/__fixture__.ts',
      code: 'import { x } from "../../../core/modules/src/__ledger-fixture__";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a lib may NOT reach apps', async () => {
    await expect({
      file: 'libs/observability/src/__fixture__.ts',
      code: 'import { x } from "../../../apps/__libs-fixture__/src/features/product/product.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a lib MAY import its own files', async () => {
    await expect({
      file: 'libs/http/src/__fixture__.ts',
      code: 'import { x } from "./exceptions/unauthorized-http.exception";',
    }).toPassArchitectureLint();
  });

  it.each([
    ['kernel', []],
    ['toolkit', []],
    ['auth', ['kernel', 'toolkit']],
    ['cache', ['kernel', 'toolkit', 'observability']],
    ['config', ['kernel', 'toolkit']],
    ['credentials', ['kernel', 'toolkit']],
    ['database', ['kernel', 'toolkit']],
    ['health', ['kernel', 'toolkit', 'observability']],
    ['http', ['kernel', 'toolkit', 'database', 'observability']],
    ['observability', ['kernel', 'toolkit', 'config']],
    ['openapi', ['kernel', 'toolkit']],
  ])('%s may import only %j of the other libs', async (from, allowed) => {
    const libs = [
      'auth',
      'cache',
      'config',
      'credentials',
      'database',
      'health',
      'http',
      'kernel',
      'observability',
      'openapi',
      'toolkit',
    ];

    for (const to of libs.filter((lib) => lib !== from)) {
      if (allowed.includes(to)) {
        await expect({
          file: `libs/${from}/src/__fixture__.ts`,
          code: `import { x } from "../../${to}/src";`,
        }).toPassArchitectureLint();
      } else {
        await expect({
          file: `libs/${from}/src/__fixture__.ts`,
          code: `import { x } from "../../${to}/src";`,
        }).toBreakRule('boundaries/dependencies');
      }
    }
  });

  it.each([
    ['auth', ['auth']],
    ['cache', ['cache']],
    ['config', []],
    ['credentials', ['credentials']],
    ['database', ['database']],
    ['health', ['cache', 'health']],
    ['http', []],
    ['kernel', []],
    ['observability', []],
    ['openapi', []],
    ['toolkit', []],
  ])('%s may import only the contracts of %j', async (from, allowed) => {
    const contracts = ['auth', 'cache', 'credentials', 'database', 'health'];

    for (const to of contracts) {
      if (allowed.includes(to)) {
        await expect({
          file: `libs/${from}/src/infrastructure/__fixture__.ts`,
          code: `import { x } from "../../../contracts/src/${to}";`,
        }).toPassArchitectureLint();
      } else {
        await expect({
          file: `libs/${from}/src/infrastructure/__fixture__.ts`,
          code: `import { x } from "../../../contracts/src/${to}";`,
        }).toBreakRule('boundaries/dependencies');
      }
    }
  });

  it.each(['auth', 'cache', 'credentials', 'database', 'health'])(
    'the contracts of %s MAY import the framework-free libs',
    async (lib) => {
      await expect({
        file: `libs/contracts/src/${lib}/__fixture__.ts`,
        code: 'import { x } from "../../../kernel/src";\nimport { y } from "../../../toolkit/src";',
      }).toPassArchitectureLint();
    },
  );

  it.each([
    ['libs/contracts/src/cache/__fixture__.ts', '../../../cache/src'],
    ['libs/contracts/src/cache/__fixture__.ts', '../../../observability/src'],
    ['libs/contracts/src/cache/__fixture__.ts', '../database'],
  ])(
    '%s may NOT import %s, contracts depend on nothing but the framework-free libs',
    async (file, source) => {
      await expect({ file, code: `import { x } from "${source}";` }).toBreakRule(
        'boundaries/dependencies',
      );
    },
  );

  it.each([
    ['toolkit', '@nestjs/common'],
    ['toolkit', 'rxjs'],
    ['kernel', '@nestjs/common'],
    ['kernel', 'reflect-metadata'],
    ['kernel', 'crypto'],
  ])('the framework-free lib %s may NOT import %s', async (lib, source) => {
    await expect({
      file: `libs/${lib}/src/__fixture__.ts`,
      code: `import { x } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it('the toolkit lib MAY import crypto (DomainEvent ids, BodyFingerprintHelper)', async () => {
    await expect({
      file: 'libs/toolkit/src/__fixture__.ts',
      code: 'import { createHash, randomUUID } from "crypto";',
    }).toPassArchitectureLint();
  });

  it('the config lib MAY import the Nest config packages it wraps', async () => {
    await expect({
      file: 'libs/config/src/provider/__fixture__.ts',
      code: 'import { Provider } from "@nestjs/common";\nimport { ConfigService } from "@nestjs/config";',
    }).toPassArchitectureLint();
  });

  it('the config lib MAY import fs and path to find the env files of an app', async () => {
    await expect({
      file: 'libs/config/src/env/__fixture__.ts',
      code: 'import { existsSync } from "fs";\nimport { dirname, join } from "path";',
    }).toPassArchitectureLint();
  });

  it('the config lib may NOT import dotenv — @nestjs/config loads the env files', async () => {
    await expect({
      file: 'libs/config/src/env/__fixture__.ts',
      code: 'import dotenv from "dotenv";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the config lib may NOT import joi — each app owns its schema', async () => {
    await expect({
      file: 'libs/config/src/provider/__fixture__.ts',
      code: 'import Joi from "joi";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the observability lib MAY import the logging, tracing and async context packages', async () => {
    await expect({
      file: 'libs/observability/src/correlation/__fixture__.ts',
      code:
        'import { AsyncLocalStorage } from "async_hooks";\n' +
        'import { trace } from "@opentelemetry/api";\n' +
        'import { NodeSDK } from "@opentelemetry/sdk-node";\n' +
        'import { PinoLogger } from "nestjs-pino";',
    }).toPassArchitectureLint();
  });

  it('the health lib MAY import the packages its probes and use cases need', async () => {
    await expect({
      file: 'libs/health/src/infrastructure/probes/__fixture__.ts',
      code:
        'import { Injectable } from "@nestjs/common";\n' +
        'import { PinoLogger } from "nestjs-pino";\n' +
        'import { DataSource } from "typeorm";',
    }).toPassArchitectureLint();
  });

  it.each(['ioredis', '@nestjs/typeorm', '@nestjs/config'])(
    'the health lib may NOT import %s',
    async (source) => {
      await expect({
        file: 'libs/health/src/infrastructure/probes/__fixture__.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it('the auth lib MAY import the Nest packages its guards and token check need', async () => {
    await expect({
      file: 'libs/auth/src/guards/__fixture__.ts',
      code:
        'import { Injectable } from "@nestjs/common";\n' +
        'import { ConfigService } from "@nestjs/config";\n' +
        'import { Reflector } from "@nestjs/core";\n' +
        'import { JwtService } from "@nestjs/jwt";',
    }).toPassArchitectureLint();
  });

  it.each(['typeorm', 'nestjs-pino', 'argon2'])(
    'the auth lib may NOT import %s',
    async (source) => {
      await expect({
        file: 'libs/auth/src/guards/__fixture__.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it('the credentials lib MAY import the packages hashing and signing need', async () => {
    await expect({
      file: 'libs/credentials/src/password-hasher/__fixture__.ts',
      code:
        'import { Injectable } from "@nestjs/common";\n' +
        'import { ConfigService } from "@nestjs/config";\n' +
        'import { JwtService } from "@nestjs/jwt";\n' +
        'import { hash } from "argon2";',
    }).toPassArchitectureLint();
  });

  it.each(['typeorm', 'nestjs-pino'])('the credentials lib may NOT import %s', async (source) => {
    await expect({
      file: 'libs/credentials/src/password-hasher/__fixture__.ts',
      code: `import { x } from "${source}";`,
    }).toBreakRule('boundaries/dependencies');
  });

  it.each(['http', 'health', 'observability'])(
    'the %s lib may NOT import @nestjs/jwt — auth verifies tokens and credentials signs them',
    async (lib) => {
      await expect({
        file: `libs/${lib}/src/__fixture__.ts`,
        code: 'import { JwtService } from "@nestjs/jwt";',
      }).toBreakRule('boundaries/dependencies');
    },
  );

  it.each(['nestjs-pino', '@opentelemetry/api', 'async_hooks'])(
    'the kernel lib may NOT import %s',
    async (source) => {
      await expect({
        file: 'libs/kernel/src/__fixture__.ts',
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    },
  );
});
