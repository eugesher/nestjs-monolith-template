import { to } from './selectors.mjs';

const staffEntities = [
  'StaffPermission',
  'StaffRole',
  'StaffRolePermission',
  'StaffUser',
  'StaffUserRole',
];

const ownerOf = (app, entities) => ({
  from: { file: { categories: 'acme-app:*', captured: { app } } },
  disallow: [{ ...to('acme-core:entities'), dependency: { specifiers: entities } }],
});

const ormEntitiesOf = (app, entities) => ({
  from: {
    file: {
      categories: 'acme-app:app',
      captured: { app },
      path: `apps/${app}/src/app/setup/orm/entities/index.ts`,
    },
  },
  allow: [{ ...to('acme-core:entities'), dependency: { specifiers: entities } }],
});

export const userEntities = [
  {
    ...ownerOf('staff-app', ['Customer']),
    message:
      'the Customer entity belongs to customer-app: staff-app signs in its staff through its own auth modules',
  },
  ormEntitiesOf('staff-app', ['Customer']),
  {
    ...ownerOf('customer-app', staffEntities),
    message:
      'the staff identity entities belong to staff-app: customer-app signs in customers only',
  },
  {
    from: { file: { categories: 'acme-app:*', captured: { app: 'customer-app' } } },
    disallow: [
      {
        ...to('acme-core:contracts'),
        dependency: { specifiers: ['STAFF_AUTH_CORE_PORT', 'IStaffAuthCorePort'] },
      },
      { ...to('acme-core:modules:index'), dependency: { specifiers: ['StaffAuthCoreModule'] } },
    ],
    message:
      'the core staff-auth module serves the staff apps: customer-app signs in customers only',
  },
  {
    ...ownerOf('processor-app', staffEntities),
    message:
      'the staff identity entities belong to staff-app: processor-app reads the staff through the core staff-auth module',
  },
  ormEntitiesOf('processor-app', staffEntities),
];
