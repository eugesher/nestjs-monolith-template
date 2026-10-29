import { spawnSync } from 'child_process';
import * as path from 'path';

import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('repo', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'core/entities/src/index.ts',
      'libs/toolkit/src/index.ts',
      'migrations/config/data-source.ts',
      'scripts/support/script-args.ts',
      'docker-compose/database-and-tests/seed/support/seed-rows.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  describe('docker-compose scripts (repo:docker-compose)', () => {
    it('a seed script MAY import its own support files', async () => {
      await expect({
        file: 'docker-compose/database-and-tests/seed/__fixture__.ts',
        code: 'import { x } from "./support/seed-rows";',
      }).toPassArchitectureLint();
    });

    it.each(['fs', 'joi', 'path', 'typeorm'])('a seed script MAY import %s', async (source) => {
      await expect({
        file: 'docker-compose/database-and-tests/seed/__fixture__.ts',
        code: `import x from "${source}";`,
      }).toPassArchitectureLint();
    });

    it('a seed script may NOT import dotenv — the database comes from the environment of the process', async () => {
      await expect({
        file: 'docker-compose/database-and-tests/seed/__fixture__.ts',
        code: 'import dotenv from "dotenv";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each(['../../../libs/toolkit/src', '../../../core/entities/src'])(
      'a seed script may NOT import project code (%s) — it runs under plain node',
      async (source) => {
        await expect({
          file: 'docker-compose/database-and-tests/seed/__fixture__.ts',
          code: `import { x } from "${source}";`,
        }).toBreakRule('boundaries/dependencies');
      },
    );
  });

  describe('migrations (repo:migrations)', () => {
    it('a migration MAY import the migrations config', async () => {
      await expect({
        file: 'migrations/snapshots/__fixture__.ts',
        code: 'import { x } from "../config/data-source";',
      }).toPassArchitectureLint();
    });

    it('a migration may NOT import project code — it runs under plain node', async () => {
      await expect({
        file: 'migrations/snapshots/__fixture__.ts',
        code: 'import { x } from "../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each(['dotenv', 'joi', 'path', 'typeorm'])(
      'the migrations config MAY import %s',
      async (source) => {
        await expect({
          file: 'migrations/config/__fixture__.ts',
          code: `import x from "${source}";`,
        }).toPassArchitectureLint();
      },
    );

    it('a migration may NOT import a package outside its allowlist', async () => {
      await expect({
        file: 'migrations/snapshots/__fixture__.ts',
        code: 'import { Module } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('scripts (repo:scripts)', () => {
    it('a script MAY import its own support files', async () => {
      await expect({
        file: 'scripts/__fixture__.ts',
        code: 'import { x } from "./support/script-args";',
      }).toPassArchitectureLint();
    });

    it.each(['fs', 'path'])('a script MAY import %s', async (source) => {
      await expect({
        file: 'scripts/__fixture__.ts',
        code: `import { x } from "${source}";`,
      }).toPassArchitectureLint();
    });

    it('a script may NOT import a package outside its allowlist', async () => {
      await expect({
        file: 'scripts/__fixture__.ts',
        code: 'import { DataSource } from "typeorm";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a script may NOT import project code', async () => {
      await expect({
        file: 'scripts/__fixture__.ts',
        code: 'import { x } from "../libs/toolkit/src";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('plain node files (migrations, scripts, seeds)', () => {
    it.each([
      ['migrations/snapshots/__fixture__.ts', '__dirname'],
      ['migrations/config/__fixture__.ts', '__filename'],
      ['scripts/__fixture__.ts', 'require'],
      ['docker-compose/database-and-tests/seed/__fixture__.ts', 'module'],
      ['scripts/__fixture__.ts', 'exports'],
    ])(
      '%s may NOT use the CommonJS global %s — node runs it as an ES module',
      async (file, name) => {
        await expect({ file, code: `export const x = ${name};` }).toBreakRule(
          'no-restricted-globals',
        );
      },
    );

    it('the ES module path of the file is open', async () => {
      await expect({
        file: 'migrations/config/__fixture__.ts',
        code: 'export const x = import.meta.dirname;',
      }).toPassArchitectureLint();
    });

    it.each(['joi', 'dotenv', 'typeorm'])(
      'a namespace import of the CommonJS package %s is forbidden — it has no callable members under ESM',
      async (source) => {
        await expect({
          file: 'migrations/config/__fixture__.ts',
          code: `import * as x from "${source}";`,
        }).toBreakRule('no-restricted-syntax');
      },
    );

    it.each(['path', 'node:path', 'fs/promises'])(
      'a namespace import of the node module %s is allowed',
      async (source) => {
        await expect({
          file: 'scripts/__fixture__.ts',
          code: `import * as x from "${source}";`,
        }).not.toBreakRule('no-restricted-syntax');
      },
    );

    it('the CommonJS globals stay open to the app code', async () => {
      await expect({
        file: 'apps/__repo-fixture__/src/main.ts',
        code: 'export const x = __dirname;',
      }).not.toBreakRule('no-restricted-globals');
    });
  });

  describe('working directory', () => {
    it.each([
      ['migrations', 'config/data-source.ts'],
      ['apps/admin-api', 'src/main.ts'],
    ])(
      'linting from %s, as an editor does from the nearest package, classifies %s from the repo root',
      (cwd, file) => {
        const root = path.resolve(__dirname, '../..');
        const eslint = path.join(root, 'node_modules/eslint/bin/eslint.js');

        const result = spawnSync(process.execPath, [eslint, '--max-warnings', '0', file], {
          cwd: path.join(root, cwd),
          encoding: 'utf8',
        });

        expect(result.stdout).toBe('');
        expect(result.status).toBe(0);
      },
    );
  });

  describe('root configs (repo:config)', () => {
    it('a root TypeScript file is a known file', async () => {
      await expect({
        file: '__fixture__.ts',
        code: 'export const x = 1;',
      }).toPassArchitectureLint();
    });
  });

  describe('repo specs (repo:spec)', () => {
    it('a repo spec MAY import the spec support', async () => {
      await expect({
        file: 'spec/architecture/__fixture__.spec.ts',
        code: 'import { x } from "../support/lint";',
      }).toPassArchitectureLint();
    });

    it('a repo spec MAY drive ESLint', async () => {
      await expect({
        file: 'spec/support/__fixture__.ts',
        code: 'import { ESLint } from "eslint";',
      }).toPassArchitectureLint();
    });

    it('a repo spec may NOT import project code', async () => {
      await expect({
        file: 'spec/architecture/__fixture__.spec.ts',
        code: 'import { x } from "../../libs/toolkit/src";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('unknown files', () => {
    it('a file matching NO pattern fails lint', async () => {
      await expect({
        file: 'apps/__repo-fixture__/src/__fixture__.ts',
        code: 'export const orphan = 1;',
      }).toBreakRule('boundaries/no-unknown-files');
    });

    it('an import of a file outside every pattern fails lint', async () => {
      await expect({
        file: 'apps/__repo-fixture__/src/features/item/domain/__fixture__.ts',
        code: 'import x from "../../../../../../package.json";',
      }).toBreakRule('boundaries/no-unknown-dependencies');
    });
  });
});
