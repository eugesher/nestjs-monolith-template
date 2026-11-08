import { libs } from './selectors.mjs';

const authNames = '{AuthJwtModule,CurrentUser,Public}';
const kernelNames =
  '{AppNameEnum,HealthDependencyStatusEnum,HealthLivenessStatusEnum,HealthReadinessStatusEnum,IdentityExceptionCodeEnum,ProductStatusEnum,UserStatusEnum}';

export const customerClaims = {
  from: { file: { categories: 'acme-app:*', captured: { app: 'customer-app' } } },
  disallow: [
    { ...libs('auth'), dependency: { specifiers: [`!${authNames}`] } },
    { ...libs('kernel'), dependency: { specifiers: [`!${kernelNames}`] } },
  ],
  message: `a customer holds no roles or permissions: customer-app takes only ${authNames} from @acme-libs/auth and ${kernelNames} from @acme-libs/kernel`,
};
