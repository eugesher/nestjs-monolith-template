import { to } from '../selectors.mjs';

export const identityAdmin = {
  from: { file: { categories: 'acme-app:*', captured: { app: 'client-api' } } },
  disallow: [
    {
      ...to('acme-core:contracts', { module: 'identity' }),
      dependency: { specifiers: ['IDENTITY_CORE_ADMIN_PORT', 'IIdentityCoreAdminPort'] },
    },
  ],
  message: 'client-api has no back office: the identity admin port belongs to admin-api',
};
