import { to } from './selectors.mjs';

const ownerOf = (app, module, entities) => ({
  from: { file: { categories: 'acme-app:*', captured: { app } } },
  disallow: [
    to('acme-core:contracts', { module }),
    to('acme-core:modules:index', { module }),
    { ...to('acme-core:entities'), dependency: { specifiers: entities } },
  ],
});

export const identityModules = [
  {
    ...ownerOf('customer-app', 'staff-identity', ['Staff*']),
    message:
      'staff-identity belongs to staff-app: customer-app knows its customers through customer-identity',
  },
  {
    ...ownerOf('staff-app', 'customer-identity', ['Customer']),
    message:
      'customer-identity belongs to customer-app: staff-app knows its staff through staff-identity',
  },
  {
    from: {
      file: {
        categories: 'acme-app:app',
        captured: { app: 'staff-app' },
        path: 'apps/staff-app/src/app/setup/orm/entities/index.ts',
      },
    },
    allow: [{ ...to('acme-core:entities'), dependency: { specifiers: ['Customer'] } }],
  },
];
