import { Global, Module } from '@nestjs/common';

import { CustomerIdentityCommonModule } from '@acme-customer-common/modules/customer-identity';
import { AuthLibModule } from '@acme-libs/auth';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { AuthGlobalCustomerIdentityCommonAdapter } from '../infrastructure';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [AuthLibModule, CustomerIdentityCommonModule],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalCustomerIdentityCommonAdapter,
  ],
})
export class AuthGlobalModule {}
