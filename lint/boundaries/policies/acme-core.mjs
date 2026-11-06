import {
  baseLibs,
  from,
  fromFile,
  layerOf,
  libContracts,
  libs,
  own,
  packages,
  persistenceInterfaces,
  to,
} from './selectors.mjs';

const layer = layerOf('acme-core:modules', ['module']);

const ownContracts = to('acme-core:contracts', own('module'));

export const acmeCore = [
  from('acme-core:modules:domain', [layer('domain'), baseLibs()]),
  from('acme-core:modules:outbound', [
    layer('domain'),
    layer('outbound'),
    baseLibs(),
    libs('ledger'),
  ]),
  fromFile('acme-core:modules:outbound', persistenceInterfaces, [to('acme-core:entities')]),
  from('acme-core:modules:application', [
    layer('domain'),
    layer('outbound'),
    layer('application'),
    ownContracts,
    baseLibs('ledger', 'observability'),
    libContracts('database'),
    packages('nestjs-pino'),
  ]),
  from('acme-core:modules:infrastructure', [
    layer('outbound'),
    layer('infrastructure'),
    layer('infrastructure:queue'),
    layer('infrastructure:config'),
    to('acme-core:entities'),
    baseLibs(),
    libContracts('cache', 'database'),
    packages('@nestjs/common', 'typeorm'),
  ]),
  from('acme-core:modules:infrastructure:queue', [
    layer('outbound'),
    layer('infrastructure:queue'),
    ownContracts,
    to('acme-core:contracts', { module: 'ledger' }),
    baseLibs('ledger'),
    packages('@nestjs/bull', '@nestjs/common', 'bull'),
  ]),
  from('acme-core:modules:infrastructure:config', [
    layer('outbound'),
    layer('infrastructure:config'),
    libs('config'),
  ]),
  from('acme-core:modules:shell:facade', [layer('application'), ownContracts, baseLibs()]),
  from('acme-core:modules:shell', [
    layer('application'),
    layer('infrastructure'),
    layer('shell:facade'),
    layer('shell'),
    ownContracts,
    to('acme-core:contracts', { module: 'ledger' }),
    baseLibs(),
    packages('@nestjs/bull'),
  ]),
  from('acme-core:modules:index', [layer('shell')]),
  from('acme-core:contracts', [ownContracts, baseLibs()]),
  from('acme-core:entities', [to('acme-core:entities'), libs('kernel'), packages('typeorm')]),
];
