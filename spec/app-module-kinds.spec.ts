import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';

import {
  appModules,
  moduleKindViolationOf,
  moduleKindViolations,
} from './support/app-module-kinds';

describe('feature kinds: an aggregator or a regular module, never both', () => {
  it('finds the modules of every app', () => {
    const relPaths = appModules().map(({ relPath }) => relPath);

    expect(relPaths).toEqual(
      expect.arrayContaining([
        'apps/staff-app/src/features/health',
        'apps/customer-app/src/features/health',
      ]),
    );
  });

  it('every feature is either an aggregator or a regular module', () => {
    const violations = moduleKindViolations();

    expect(violations).toEqual([]);
  });

  describe('the walk over nested modules', () => {
    let root: string;

    beforeAll(() => {
      root = mkdtempSync(path.join(tmpdir(), 'app-module-kinds-'));

      for (const file of [
        'apps/app/src/features/item/item.module.ts',
        'apps/app/src/features/item/presentation/controllers/item.controller.ts',
        'apps/app/src/features/ledger/ledger.module.ts',
        'apps/app/src/features/ledger/modules/index.ts',
        'apps/app/src/features/ledger/modules/ledger-export/ledger-export.module.ts',
        'apps/app/src/features/ledger/modules/ledger-export/modules/deeper/deeper.module.ts',
        'apps/app/src/processors/catalog-events/catalog-events.module.ts',
        'apps/app/src/processors/catalog-events/presentation/catalog-events.consumer.ts',
        'apps/app/src/processors/purge/purge.module.ts',
        'apps/app/src/processors/purge/presentation/controllers/purge.controller.ts',
        'apps/app/src/processors/digest/digest.module.ts',
        'apps/app/src/processors/digest/presentation/digest.controller.ts',
      ]) {
        mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        writeFileSync(path.join(root, file), '');
      }
    });

    afterAll(() => {
      rmSync(root, { recursive: true, force: true });
    });

    it('goes exactly one level into modules/ of a top-level module, in features and processors', () => {
      expect(
        appModules(root)
          .map(({ relPath, area, nested }) => ({ relPath, area, nested }))
          .sort((a, b) => a.relPath.localeCompare(b.relPath)),
      ).toEqual([
        { relPath: 'apps/app/src/features/item', area: 'features', nested: false },
        { relPath: 'apps/app/src/features/ledger', area: 'features', nested: false },
        {
          relPath: 'apps/app/src/features/ledger/modules/ledger-export',
          area: 'features',
          nested: true,
        },
        { relPath: 'apps/app/src/processors/catalog-events', area: 'processors', nested: false },
        { relPath: 'apps/app/src/processors/digest', area: 'processors', nested: false },
        { relPath: 'apps/app/src/processors/purge', area: 'processors', nested: false },
      ]);
    });

    it('flags the submodule that aggregates modules of its own and the processors without a consumer', () => {
      expect(
        appModules(root)
          .filter((module) => moduleKindViolationOf(module) !== null)
          .map(({ relPath }) => relPath)
          .sort(),
      ).toEqual([
        'apps/app/src/features/ledger/modules/ledger-export',
        'apps/app/src/processors/digest',
        'apps/app/src/processors/purge',
      ]);
    });
  });

  describe('the rule itself', () => {
    it.each([
      [
        'an aggregator',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: ['modules'],
          entryPoints: [],
        },
      ],
      [
        'a regular module',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: ['domain', 'application', 'presentation'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'a regular submodule',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: true,
          files: ['x.module.ts'],
          folders: ['presentation'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'a regular processor',
        {
          relPath: 'x',
          name: 'x',
          area: 'processors' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: ['application', 'presentation'],
          entryPoints: ['x.consumer.ts'],
        },
      ],
    ])('accepts %s', (_, module) => {
      expect(moduleKindViolationOf(module)).toBeNull();
    });

    it.each([
      [
        'an aggregator with a layer',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: ['modules', 'domain'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'an aggregator with an extra file',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts', 'x.service.ts'],
          folders: ['modules'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'a regular module with a non-layer folder',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: ['domain', 'utils'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'a regular module with an extra file',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts', 'helpers.ts'],
          folders: ['domain'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'a submodule that aggregates',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: true,
          files: ['x.module.ts'],
          folders: ['modules'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'a module without its nest module',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['y.module.ts'],
          folders: ['domain'],
          entryPoints: ['x.controller.ts'],
        },
      ],
      [
        'a module with no layers yet',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: [],
          entryPoints: [],
        },
      ],
      [
        'a regular module without a controller',
        {
          relPath: 'x',
          name: 'x',
          area: 'features' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: ['domain', 'application', 'presentation'],
          entryPoints: [],
        },
      ],
      [
        'a processor without a consumer',
        {
          relPath: 'x',
          name: 'x',
          area: 'processors' as const,
          nested: false,
          files: ['x.module.ts'],
          folders: ['application', 'presentation'],
          entryPoints: [],
        },
      ],
    ])('rejects %s', (_, module) => {
      expect(moduleKindViolationOf(module)).not.toBeNull();
    });
  });
});
