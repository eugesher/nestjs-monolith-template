import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('nested features (<module>/modules/<submodule>)', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__nested-fixture__/src/features/index.ts',
      'apps/__nested-fixture__/src/features/note/note.module.ts',
      'apps/__nested-fixture__/src/features/note/application/index.ts',
      'apps/__nested-fixture__/src/features/note/modules/index.ts',
      'apps/__nested-fixture__/src/features/ledger/ledger.module.ts',
      'apps/__nested-fixture__/src/features/ledger/modules/index.ts',
      'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/ledger-export.module.ts',
      'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/presentation/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  it('a submodule domain is framework-free like any domain', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/domain/__fixture__.ts',
      code: 'import { x } from "@nestjs/common";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a submodule application may NOT reach its presentation like any application', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/application/__fixture__.ts',
      code: 'import { x } from "../presentation";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the submodule root MAY see every layer of its own submodule', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/__fixture__.ts',
      code: 'import { x } from "./presentation";',
    }).toPassArchitectureLint();
  });

  it('the parent root MAY mount its submodules through modules/index.ts', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/__fixture__.ts',
      code: 'import { x } from "./modules";',
    }).toPassArchitectureLint();
  });

  it('the parent root may NOT skip modules/index.ts', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/__fixture__.ts',
      code: 'import { x } from "./modules/ledger-export/ledger-export.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the parent root may NOT reach a submodule layer', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/__fixture__.ts',
      code: 'import { x } from "./modules/ledger-export/presentation";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the submodules index MAY re-export the nest modules of its own submodules', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/index.ts',
      code: 'export * from "./ledger-export/ledger-export.module";',
    }).toPassArchitectureLint();
  });

  it('the submodules index may NOT re-export a submodule layer', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/index.ts',
      code: 'export * from "./ledger-export/presentation";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the submodules index may NOT re-export submodules of another module', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/note/modules/index.ts',
      code: 'export * from "../../ledger/modules/ledger-export/ledger-export.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('isolated: the parent layers may NOT reach a submodule', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/application/__fixture__.ts',
      code: 'import { x } from "../modules/ledger-export/presentation";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('isolated: a submodule may NOT reach its parent', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/presentation/__fixture__.ts',
      code: 'import { x } from "../../../ledger.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('isolated: a submodule may NOT reach a sibling', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/other/presentation/__fixture__.ts',
      code: 'import { x } from "../../ledger-export/presentation";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('isolated: a submodule may NOT reach a top-level module', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/presentation/__fixture__.ts',
      code: 'import { x } from "../../../../note/application";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('isolated: a top-level module may NOT reach a submodule', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/note/presentation/__fixture__.ts',
      code: 'import { x } from "../../ledger/modules/ledger-export/presentation";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('the features index MAY re-export a top-level module', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/index.ts',
      code: 'export * from "./ledger/ledger.module";',
    }).toPassArchitectureLint();
  });

  it('the features index may NOT re-export a submodule', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/index.ts',
      code: 'export * from "./ledger/modules/ledger-export/ledger-export.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('bootstrap may NOT mount a submodule', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/app/__fixture__.ts',
      code: 'import { x } from "../features/ledger/modules/ledger-export/ledger-export.module";',
    }).toBreakRule('boundaries/dependencies');
  });

  it('a second nesting level is an unknown file', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/ledger-export/modules/deeper/presentation/__fixture__.ts',
      code: 'export const orphan = 1;',
    }).toBreakRule('boundaries/no-unknown-files');
  });

  it('a stray file next to the submodules index is an unknown file', async () => {
    await expect({
      file: 'apps/__nested-fixture__/src/features/ledger/modules/__fixture__.ts',
      code: 'export const orphan = 1;',
    }).toBreakRule('boundaries/no-unknown-files');
  });
});
