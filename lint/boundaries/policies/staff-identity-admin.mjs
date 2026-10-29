import { to } from './selectors.mjs';

export const staffIdentityAdmin = {
  from: { file: { categories: 'acme-app:*', captured: { app: 'customer-app' } } },
  disallow: [
    {
      ...to('acme-core:contracts', { module: 'staff-identity' }),
      dependency: { specifiers: ['STAFF_IDENTITY_CORE_ADMIN_PORT', 'IStaffIdentityCoreAdminPort'] },
    },
  ],
  message: 'customer-app has no back office: the staff identity admin port belongs to staff-app',
};
