export const acmeCore = [
  ['acme-core:modules:domain', 'core/modules/src/*/domain/**', ['module']],
  ['acme-core:modules:outbound', 'core/modules/src/*/outbound/**', ['module']],
  ['acme-core:modules:application', 'core/modules/src/*/application/**', ['module']],
  ['acme-core:modules:infrastructure', 'core/modules/src/*/infrastructure/**', ['module']],
  ['acme-core:modules:module:facade', 'core/modules/src/*/module/*.facade.ts', ['module']],
  ['acme-core:modules:module', 'core/modules/src/*/module/**', ['module']],
  ['acme-core:modules:index', 'core/modules/src/*/index.ts', ['module']],
  ['acme-core:contracts', 'core/contracts/src/*/**', ['module']],
  ['acme-core:entities', 'core/entities/src/**', []],
];
