import { from, layerOf, libContracts, libs, own, to } from '../selectors.mjs';

const layer = layerOf('acme-core:modules', ['module']);

const ownContracts = to('acme-core:contracts', own('module'));

export const acmeCore = [
  from('acme-core:modules:domain', [layer('domain'), libs('kernel', 'toolkit')]),
  from('acme-core:modules:outbound', [
    layer('domain'),
    layer('outbound'),
    ownContracts,
    libs('kernel', 'toolkit'),
  ]),
  from('acme-core:modules:application', [
    layer('domain'),
    layer('outbound'),
    layer('application'),
    ownContracts,
    libs('kernel', 'observability', 'toolkit'),
    libContracts('database'),
  ]),
  from('acme-core:modules:infrastructure', [
    layer('domain'),
    layer('outbound'),
    layer('infrastructure'),
    ownContracts,
    to('acme-core:entities'),
    libs('database', 'kernel', 'toolkit'),
    to('acme-libs:contracts'),
  ]),
  from('acme-core:modules:module:facade', [
    layer('application'),
    ownContracts,
    libs('http', 'kernel', 'observability', 'toolkit'),
  ]),
  from('acme-core:modules:module', [
    layer('domain'),
    layer('outbound'),
    layer('application'),
    layer('infrastructure'),
    layer('module:facade'),
    layer('module'),
    ownContracts,
    libs('kernel', 'toolkit'),
  ]),
  from('acme-core:modules:index', [layer('module')]),
  from('acme-core:contracts', [ownContracts, libs('kernel', 'toolkit')]),
  from('acme-core:entities', [to('acme-core:entities'), libs('kernel')]),
];
