import { baseLibs, from, layerOf, libContracts, libs, own, packages, to } from './selectors.mjs';

const layer = layerOf('acme-core:modules', ['module']);

const ownContracts = to('acme-core:contracts', own('module'));

export const acmeCore = [
  from('acme-core:modules:domain', [layer('domain'), baseLibs()]),
  from('acme-core:modules:outbound', [layer('domain'), layer('outbound'), baseLibs()]),
  from('acme-core:modules:application', [
    layer('domain'),
    layer('outbound'),
    layer('application'),
    ownContracts,
    baseLibs('observability'),
    libContracts('database'),
    packages('nestjs-pino'),
  ]),
  from('acme-core:modules:infrastructure', [
    layer('domain'),
    layer('outbound'),
    layer('infrastructure'),
    layer('infrastructure:queue'),
    to('acme-core:entities'),
    baseLibs('database'),
    libContracts('cache'),
    packages(
      '@nestjs-cls/transactional',
      '@nestjs-cls/transactional-adapter-typeorm',
      '@nestjs/common',
      '@nestjs/typeorm',
      'typeorm',
    ),
  ]),
  from('acme-core:modules:infrastructure:queue', [
    layer('domain'),
    layer('outbound'),
    layer('infrastructure:queue'),
    ownContracts,
    to('acme-core:contracts', { module: 'ledger' }),
    baseLibs(),
    packages('@nestjs/bull', '@nestjs/common', 'bull'),
  ]),
  from('acme-core:modules:module:facade', [layer('application'), ownContracts, baseLibs()]),
  from('acme-core:modules:module', [
    layer('outbound'),
    layer('application'),
    layer('infrastructure'),
    layer('module:facade'),
    layer('module'),
    ownContracts,
    to('acme-core:contracts', { module: 'ledger' }),
    baseLibs('config'),
    packages('@nestjs/bull'),
  ]),
  from('acme-core:modules:index', [layer('module')]),
  from('acme-core:contracts', [ownContracts, baseLibs()]),
  from('acme-core:entities', [to('acme-core:entities'), libs('kernel'), packages('typeorm')]),
];
