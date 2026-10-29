import { Global, Module } from '@nestjs/common';

import { CustomerIdentityCoreModule } from '@acme-core/modules/customer-identity';
import { AuthLibModule } from '@acme-libs/auth';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { AuthCustomerIdentityCoreAdapter } from '../infrastructure';
import { AuthFacade } from './auth.facade';

@Global()
@Module({
  imports: [AuthLibModule, CustomerIdentityCoreModule],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthFacade },
    AuthCustomerIdentityCoreAdapter,
  ],
})
export class AuthModule {}
