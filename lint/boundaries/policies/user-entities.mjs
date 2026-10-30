import { to } from './selectors.mjs';

const ownerOf = (app, entities) => ({
  from: { file: { categories: 'acme-app:*', captured: { app } } },
  disallow: [{ ...to('acme-core:entities'), dependency: { specifiers: entities } }],
});

export const userEntities = [
  {
    ...ownerOf('customer-app', ['Staff*']),
    message:
      'the Staff* entities belong to staff-app: customer-app signs in its customers through its own auth modules',
  },
  {
    ...ownerOf('staff-app', ['Customer']),
    message:
      'the Customer entity belongs to customer-app: staff-app signs in its staff through its own auth modules',
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
