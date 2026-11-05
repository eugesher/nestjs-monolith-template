import { libs } from './selectors.mjs';

export const customerClaims = {
  from: { file: { categories: 'acme-app:*', captured: { app: 'customer-app' } } },
  disallow: [
    { ...libs('auth'), dependency: { specifiers: ['AuthClaimsLibModule', 'RequiresPermission'] } },
    { ...libs('kernel'), dependency: { specifiers: ['PermissionCodeEnum', 'RoleEnum'] } },
  ],
  message:
    'a customer holds no roles or permissions: customer-app scopes every request by its owner instead',
};
