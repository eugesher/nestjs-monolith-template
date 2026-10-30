import {
  appContracts,
  baseLibs,
  from,
  libContracts,
  libs,
  own,
  packages,
  to,
} from './selectors.mjs';

const namesakeLibContracts = to('acme-libs:contracts', { lib: '{{ from.file.captured.module }}' });

const appIndexes = [
  to('acme-app:app:global:index', own('app')),
  to('acme-app:features:index', own('app')),
  to('acme-app:processors:index', own('app')),
];

export const acmeApp = [
  from('acme-app:main', [
    to('acme-app:app:module', own('app')),
    libs('database', 'kernel', 'observability', 'openapi'),
    packages('@nestjs/config', '@nestjs/core', 'nestjs-pino'),
  ]),
  from('acme-app:app:module', [
    to('acme-app:app', own('app')),
    ...appIndexes,
    baseLibs('cache', 'http', 'observability'),
    packages('@nestjs/common', '@nestjs/core'),
  ]),
  from('acme-app:app', [
    to('acme-app:app', own('app')),
    ...appIndexes,
    to('acme-core:entities'),
    baseLibs('cache', 'config', 'database'),
    libContracts('database'),
    packages(
      '@nestjs-cls/transactional',
      '@nestjs-cls/transactional-adapter-typeorm',
      '@nestjs/bull',
      '@nestjs/common',
      '@nestjs/config',
      '@nestjs/schedule',
      '@nestjs/typeorm',
      'joi',
      'nestjs-cls',
      'typeorm',
    ),
  ]),
  from('acme-app:common:shared', [
    to('acme-app:common:shared', own('app')),
    appContracts,
    to('acme-core:contracts', { module: 'ledger' }),
    baseLibs('http', 'observability'),
    libContracts('cache'),
    packages('@nestjs/bull', '@nestjs/common', 'nestjs-pino'),
  ]),
  from('acme-app:common:shared:index', [to('acme-app:common:shared', own('app'))]),
  from('acme-app:app:global:index', [
    to('acme-app:app:global:module', { ...own('app'), module: '*' }),
  ]),
  from('acme-app:app:global:module', [
    to('acme-app:app:global:module', own('app', 'module')),
    to('acme-app:app:global:infrastructure', own('app', 'module')),
    appContracts,
    to('acme-app:common:modules:index', own('app')),
    to('acme-core:modules:index'),
    baseLibs('auth', 'config'),
    namesakeLibContracts,
    packages('@nestjs/common'),
  ]),
  from('acme-app:app:global:infrastructure', [
    to('acme-app:app:global:infrastructure', own('app', 'module')),
    to('acme-app:app:global:infrastructure:core-adapters', own('app', 'module')),
    appContracts,
    to('acme-core:entities'),
    baseLibs('database'),
  ]),
  from('acme-app:app:global:infrastructure:core-adapters', [
    to('acme-app:app:global:infrastructure:core-adapters', own('app', 'module')),
    appContracts,
    to('acme-core:contracts'),
    baseLibs(),
    namesakeLibContracts,
    packages('@nestjs/common'),
  ]),
  from('acme-app:contracts', [appContracts, baseLibs()]),
  from('acme-app:test', [
    to('acme-app:test', own('app')),
    to('acme-app:app:module', own('app')),
    to('acme-app:contracts', own('app')),
    to('acme-core:contracts', { module: 'ledger' }),
    to('acme-core:entities'),
    baseLibs('cache', 'database', 'observability'),
    packages(
      '@nestjs/bull',
      '@nestjs/common',
      '@nestjs/config',
      '@nestjs/jwt',
      '@nestjs/testing',
      'bull',
      'ioredis',
      'nestjs-pino',
      'supertest',
      'typeorm',
    ),
  ]),
];
