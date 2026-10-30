import { moduleAreaLayers, moduleAreas } from './module-layers.mjs';

export const acmeApp = [
  ['acme-app:main', 'apps/*/src/main.ts', ['app']],
  ['acme-app:app:global:index', 'apps/*/src/app/global/index.ts', ['app']],
  [
    'acme-app:app:global:infrastructure:common-adapters',
    'apps/*/src/app/global/*/infrastructure/common-adapters/**',
    ['app', 'module'],
  ],
  [
    'acme-app:app:global:infrastructure',
    'apps/*/src/app/global/*/infrastructure/**',
    ['app', 'module'],
  ],
  ['acme-app:app:global:module', 'apps/*/src/app/global/*/module/**', ['app', 'module']],
  ['acme-app:app:module', 'apps/*/src/app/app.module.ts', ['app']],
  ['acme-app:app', 'apps/*/src/app/**', ['app']],
  ['acme-app:common:modules:domain', 'apps/*/src/common/modules/*/domain/**', ['app', 'module']],
  [
    'acme-app:common:modules:outbound',
    'apps/*/src/common/modules/*/outbound/**',
    ['app', 'module'],
  ],
  [
    'acme-app:common:modules:application',
    'apps/*/src/common/modules/*/application/**',
    ['app', 'module'],
  ],
  [
    'acme-app:common:modules:infrastructure:core-adapters',
    'apps/*/src/common/modules/*/infrastructure/core-adapters/**',
    ['app', 'module', 'file'],
  ],
  [
    'acme-app:common:modules:infrastructure:common-adapters',
    'apps/*/src/common/modules/*/infrastructure/common-adapters/**',
    ['app', 'module', 'file'],
  ],
  [
    'acme-app:common:modules:infrastructure',
    'apps/*/src/common/modules/*/infrastructure/**',
    ['app', 'module'],
  ],
  [
    'acme-app:common:modules:module:facade',
    'apps/*/src/common/modules/*/module/*.facade.ts',
    ['app', 'module'],
  ],
  ['acme-app:common:modules:module', 'apps/*/src/common/modules/*/module/**', ['app', 'module']],
  ['acme-app:common:modules:index', 'apps/*/src/common/modules/*/index.ts', ['app', 'module']],
  ['acme-app:contracts', 'apps/*/src/contracts/*/**', ['app', 'module']],
  ['acme-app:common:shared:index', 'apps/*/src/common/shared/*/index.ts', ['app']],
  ['acme-app:common:shared', 'apps/*/src/common/shared/*/**', ['app', 'module']],
  ['acme-app:test', 'apps/*/test/**', ['app']],
  ...moduleAreas.flatMap((area) => [
    [`acme-app:${area}:index`, `apps/*/src/${area}/index.ts`, ['app']],
    [`acme-app:${area}:modules:index`, `apps/*/src/${area}/*/modules/index.ts`, ['app', 'module']],
    ...moduleAreaLayers.map((layer) => [
      `acme-app:${area}:${layer}`,
      `apps/*/src/${area}/{*,*/modules/*}/${layer.replace(':', '/')}/**`,
      layer.includes(':')
        ? ['app', 'module', 'single', 'area', 'submodule', 'file']
        : ['app', 'module'],
    ]),
    [`acme-app:${area}:module`, `apps/*/src/${area}/{*,*/modules/*}/*.ts`, ['app', 'module']],
  ]),
];
