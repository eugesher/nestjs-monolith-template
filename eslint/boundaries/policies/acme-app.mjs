import { appContracts, from, libContracts, libs, own, packages, to } from '../selectors.mjs';

const namesakeLibContracts = to('acme-libs:contracts', { lib: '{{ from.file.captured.module }}' });

export const acmeApp = [
  from('acme-app:main', [
    to('acme-app:app', own('app')),
    libs('database', 'kernel', 'observability', 'openapi'),
    packages('@nestjs/common', '@nestjs/config', '@nestjs/core'),
  ]),
  from('acme-app:app', [
    to('acme-app:app', own('app')),
    to('acme-app:app:global:index', own('app')),
    to('acme-app:features:index', own('app')),
    to('acme-app:processors:index', own('app')),
    to('acme-app:common:shared:index', own('app')),
    to('acme-core:entities'),
    libs('cache', 'config', 'database', 'http', 'kernel', 'messaging', 'observability', 'toolkit'),
    libContracts('database'),
    packages(
      '@nestjs-cls/transactional',
      '@nestjs-cls/transactional-adapter-typeorm',
      '@nestjs/common',
      '@nestjs/config',
      '@nestjs/typeorm',
      'joi',
      'nestjs-cls',
      'typeorm',
    ),
  ]),
  from('acme-app:common:shared', [
    to('acme-app:common:shared', own('app')),
    appContracts,
    libs('http', 'kernel', 'observability', 'toolkit'),
    libContracts('cache'),
    packages('@nestjs/common', 'nestjs-pino'),
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
    libs('auth', 'config', 'kernel', 'observability', 'toolkit'),
    namesakeLibContracts,
    packages('@nestjs/common'),
  ]),
  from('acme-app:app:global:infrastructure', [
    to('acme-app:app:global:infrastructure', own('app', 'module')),
    to('acme-app:app:global:infrastructure:core-adapters', own('app', 'module')),
    appContracts,
    to('acme-core:entities'),
    libs('database', 'kernel', 'toolkit'),
    namesakeLibContracts,
  ]),
  from('acme-app:app:global:infrastructure:core-adapters', [
    to('acme-app:app:global:infrastructure:core-adapters', own('app', 'module')),
    to('acme-app:common:shared:index', own('app')),
    appContracts,
    to('acme-core:contracts'),
    libs('kernel', 'toolkit'),
    namesakeLibContracts,
    packages('@nestjs/common'),
  ]),
  from('acme-app:contracts', [appContracts, libs('kernel', 'toolkit')]),
  from('acme-app:test', [
    to('acme-app:test', own('app')),
    to('acme-app:app', own('app')),
    to('acme-app:contracts', own('app')),
    to('acme-libs'),
    to('acme-libs:contracts'),
  ]),
];
