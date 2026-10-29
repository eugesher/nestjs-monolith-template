import { Global, Module } from '@nestjs/common';

import { CustomerIdentityCoreModule } from '@acme-core/modules/customer-identity';
import { AuthLibModule } from '@acme-libs/auth';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { AuthGlobalCustomerIdentityCoreAdapter } from '../infrastructure';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [AuthLibModule, CustomerIdentityCoreModule],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalCustomerIdentityCoreAdapter,
  ],
})
export class AuthGlobalModule {}
