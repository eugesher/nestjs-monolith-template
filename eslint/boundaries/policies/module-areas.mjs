import { from, fromSpec, layerOf, libContracts, libs, own, packages, to } from '../selectors.mjs';

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
    from(`${prefix}:domain`, [layer('domain'), libs('kernel', 'toolkit')]),
    from(`${prefix}:outbound`, [layer('domain'), layer('outbound'), libs('kernel', 'toolkit')]),
    from(`${prefix}:application`, [
      layer('domain'),
      layer('outbound'),
      layer('application'),
      ...sharedFacing.application,
      libs('kernel', 'observability', 'toolkit'),
      libContracts('database'),
      packages('nestjs-pino'),
    ]),
    from(`${prefix}:infrastructure`, [
      layer('domain'),
      layer('outbound'),
      layer('infrastructure'),
      layer('infrastructure:core-adapters'),
      layer('infrastructure:common-adapters'),
      to('acme-core:entities'),
      libs('database', 'kernel', 'toolkit'),
      to('acme-libs:contracts'),
    ]),
    fromSpec(`${prefix}:infrastructure:core-adapters`),
    from(`${prefix}:infrastructure:core-adapters`, [
      layer('domain'),
      layer('outbound'),
      to('acme-core:contracts'),
      libs('kernel', 'toolkit'),
    ]),
    fromSpec(`${prefix}:infrastructure:common-adapters`),
    from(`${prefix}:infrastructure:common-adapters`, [
      layer('domain'),
      layer('outbound'),
      to('acme-app:contracts', own('app')),
      libs('kernel', 'toolkit'),
    ]),
    from(`${prefix}:presentation`, [
      layer('domain'),
      layer('application'),
      layer('presentation'),
      ...sharedFacing.presentation,
    ]),
    from(`${prefix}:module`, [
      layer('domain'),
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
    application: [to('acme-app:common:shared:index', own('app'))],
    presentation: [
      to('acme-app:common:shared:index', own('app')),
      libContracts('health'),
      libs('auth', 'http', 'kernel', 'observability', 'toolkit'),
      packages('@nestjs/common', '@nestjs/swagger'),
    ],
    module: [
      libs('auth', 'config', 'health', 'http', 'kernel', 'toolkit'),
      packages('@nestjs/common'),
    ],
  }),
  ...areaPolicies('processors', {
    application: [],
    presentation: [
      to('acme-app:contracts', own('app')),
      libs('kernel', 'observability', 'toolkit'),
      packages('@nestjs/event-emitter'),
    ],
    module: [libs('config', 'kernel', 'toolkit')],
  }),
];
