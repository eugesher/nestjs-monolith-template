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
        file: 'migrations/__fixture__.ts',
        code: 'import { x } from "./config/data-source";',
      }).toPassArchitectureLint();
    });

    it('a migration may NOT import project code — it runs under plain node', async () => {
      await expect({
        file: 'migrations/__fixture__.ts',
        code: 'import { x } from "../core/entities/src";',
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

    it('a script may NOT import project code', async () => {
      await expect({
        file: 'scripts/__fixture__.ts',
        code: 'import { x } from "../libs/toolkit/src";',
      }).toBreakRule('boundaries/dependencies');
    });
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
