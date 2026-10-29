import { to } from './selectors.mjs';

export const identityAdmin = {
  from: { file: { categories: 'acme-app:*', captured: { app: 'customer-app' } } },
  disallow: [
    {
      ...to('acme-core:contracts', { module: 'identity' }),
      dependency: { specifiers: ['IDENTITY_CORE_ADMIN_PORT', 'IIdentityCoreAdminPort'] },
    },
  ],
  message: 'customer-app has no back office: the identity admin port belongs to staff-app',
};
