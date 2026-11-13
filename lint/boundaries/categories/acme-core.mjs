export const acmeCore = [
  ['acme-core:modules:domain', 'core/modules/src/*/domain/**', ['module']],
  ['acme-core:modules:outbound', 'core/modules/src/*/outbound/**', ['module', 'file']],
  ['acme-core:modules:application', 'core/modules/src/*/application/**', ['module']],
  [
    'acme-core:modules:infrastructure:queue',
    'core/modules/src/*/infrastructure/queue/**',
    ['module'],
  ],
  [
    'acme-core:modules:infrastructure:config',
    'core/modules/src/*/infrastructure/config/**',
    ['module'],
  ],
  [
    'acme-core:modules:infrastructure:core-adapters',
    'core/modules/src/*/infrastructure/core-adapters/**',
    ['module'],
  ],
  [
    'acme-core:modules:infrastructure:lib-adapters',
    'core/modules/src/*/infrastructure/lib-adapters/**',
    ['module'],
  ],
  ['acme-core:modules:infrastructure', 'core/modules/src/*/infrastructure/**', ['module']],
  ['acme-core:modules:shell:facade', 'core/modules/src/*/shell/*.facade.ts', ['module']],
  ['acme-core:modules:shell', 'core/modules/src/*/shell/**', ['module']],
  ['acme-core:modules:index', 'core/modules/src/*/index.ts', ['module']],
  ['acme-core:contracts', 'core/contracts/src/*/**', ['module']],
  ['acme-core:entities', 'core/entities/src/**', []],
];
