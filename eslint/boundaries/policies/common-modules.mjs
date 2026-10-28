import {
  appContracts,
  from,
  fromSpec,
  layerOf,
  libContracts,
  libs,
  own,
  to,
} from '../selectors.mjs';

const layer = layerOf('acme-app:common:modules', ['app', 'module']);

export const commonModules = [
  from('acme-app:common:modules:domain', [layer('domain'), libs('kernel', 'toolkit')]),
  from('acme-app:common:modules:outbound', [
    layer('domain'),
    layer('outbound'),
    appContracts,
    libs('kernel', 'toolkit'),
  ]),
  from('acme-app:common:modules:application', [
    layer('domain'),
    layer('outbound'),
    layer('application'),
    appContracts,
    libs('kernel', 'observability', 'toolkit'),
    libContracts('database'),
  ]),
  from('acme-app:common:modules:infrastructure', [
    layer('domain'),
    layer('outbound'),
    layer('infrastructure'),
    layer('infrastructure:core-adapters'),
    layer('infrastructure:common-adapters'),
    appContracts,
    to('acme-core:entities'),
    libs('database', 'kernel', 'toolkit'),
    to('acme-libs:contracts'),
  ]),
  fromSpec('acme-app:common:modules:infrastructure:core-adapters'),
  from('acme-app:common:modules:infrastructure:core-adapters', [
    layer('domain'),
    layer('outbound'),
    to('acme-core:contracts'),
    libs('kernel', 'toolkit'),
  ]),
  fromSpec('acme-app:common:modules:infrastructure:common-adapters'),
  from('acme-app:common:modules:infrastructure:common-adapters', [
    layer('domain'),
    layer('outbound'),
    to('acme-app:contracts', own('app')),
    libs('kernel', 'toolkit'),
  ]),
  from('acme-app:common:modules:module:facade', [
    layer('application'),
    appContracts,
    libs('http', 'kernel', 'observability', 'toolkit'),
  ]),
  from('acme-app:common:modules:module', [
    layer('domain'),
    layer('outbound'),
    layer('application'),
    layer('infrastructure'),
    layer('module:facade'),
    layer('module'),
    appContracts,
    to('acme-app:common:modules:index', own('app')),
    to('acme-app:common:shared:index', own('app')),
    to('acme-core:modules:index'),
    libs('config', 'kernel', 'toolkit'),
  ]),
  from('acme-app:common:modules:index', [layer('module')]),
];
