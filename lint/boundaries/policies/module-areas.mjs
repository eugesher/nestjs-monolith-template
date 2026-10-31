import {
  baseLibs,
  from,
  fromSpec,
  layerOf,
  libContracts,
  own,
  packages,
  to,
} from './selectors.mjs';

const areaPolicies = (area, sharedFacing) => {
  const prefix = `acme-app:${area}`;
  const layer = layerOf(prefix, ['app', 'module']);

  return [
    from(`${prefix}:index`, [to(`${prefix}:module`, { ...own('app'), module: '*' })]),
    from(`${prefix}:modules:index`, [
      to(`${prefix}:module`, {
        ...own('app'),
        module: '{{ from.file.captured.module }}/modules/*',
      }),
    ]),
    from(`${prefix}:domain`, [layer('domain'), baseLibs()]),
    from(`${prefix}:outbound`, [layer('domain'), layer('outbound'), baseLibs()]),
    from(`${prefix}:application`, [
      layer('domain'),
      layer('outbound'),
      layer('application'),
      ...sharedFacing.application,
      baseLibs('observability'),
      libContracts('database'),
      packages('nestjs-pino'),
    ]),
    from(`${prefix}:infrastructure`, [
      layer('domain'),
      layer('outbound'),
      layer('infrastructure'),
      layer('infrastructure:core-adapters'),
      layer('infrastructure:common-adapters'),
      layer('infrastructure:queue'),
      to('acme-core:entities'),
      baseLibs('database'),
      libContracts('cache'),
      ...sharedFacing.infrastructure,
    ]),
    fromSpec(`${prefix}:infrastructure:core-adapters`),
    from(`${prefix}:infrastructure:core-adapters`, [
      layer('domain'),
      layer('outbound'),
      to('acme-core:contracts'),
      baseLibs(),
      packages('@nestjs/common'),
    ]),
    fromSpec(`${prefix}:infrastructure:common-adapters`),
    from(`${prefix}:infrastructure:common-adapters`, [
      layer('domain'),
      layer('outbound'),
      to('acme-app:contracts', own('app')),
      baseLibs(),
      ...sharedFacing.commonAdapters,
    ]),
    fromSpec(`${prefix}:infrastructure:queue`),
    from(`${prefix}:infrastructure:queue`, [
      layer('domain'),
      layer('outbound'),
      to('acme-app:contracts', own('app')),
      to('acme-core:contracts', { module: 'ledger' }),
      baseLibs(),
      ...sharedFacing.queue,
    ]),
    from(`${prefix}:presentation`, [
      layer('domain'),
      layer('application'),
      layer('presentation'),
      ...sharedFacing.presentation,
    ]),
    from(`${prefix}:module`, [
      layer('outbound'),
      layer('application'),
      layer('infrastructure'),
      layer('presentation'),
      layer('modules:index'),
      to('acme-app:common:shared:index', own('app')),
      to('acme-app:common:modules:index', own('app')),
      to('acme-core:modules:index'),
      ...sharedFacing.module,
    ]),
  ];
};

export const moduleAreas = [
  ...areaPolicies('features', {
    application: [libContracts('credentials'), packages('@nestjs/common')],
    infrastructure: [
      packages(
        '@nestjs-cls/transactional',
        '@nestjs-cls/transactional-adapter-typeorm',
        '@nestjs/common',
        '@nestjs/typeorm',
        'typeorm',
      ),
    ],
    commonAdapters: [packages('@nestjs/common')],
    queue: [packages('@nestjs/bull', '@nestjs/common', 'bull')],
    presentation: [
      to('acme-app:common:shared:index', own('app')),
      libContracts('auth', 'health'),
      baseLibs('auth', 'http'),
      packages('@nestjs/common', '@nestjs/swagger', 'class-transformer', 'class-validator'),
    ],
    module: [
      baseLibs('auth', 'config', 'credentials', 'health', 'http'),
      packages('@nestjs/common'),
    ],
  }),
  ...areaPolicies('processors', {
    application: [],
    infrastructure: [
      packages(
        '@nestjs-cls/transactional',
        '@nestjs-cls/transactional-adapter-typeorm',
        '@nestjs/common',
        '@nestjs/typeorm',
        'typeorm',
      ),
    ],
    commonAdapters: [],
    queue: [packages('@nestjs/bull', '@nestjs/common', 'bull')],
    presentation: [
      to('acme-app:contracts', own('app')),
      to('acme-core:contracts', { module: ['ledger', 'product-stock'] }),
      baseLibs('observability'),
      packages('@nestjs/bull', '@nestjs/schedule', 'bull'),
    ],
    module: [baseLibs('config')],
  }),
];
