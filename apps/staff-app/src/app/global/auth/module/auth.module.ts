import { Global, Module } from '@nestjs/common';

import { StaffIdentityCoreModule } from '@acme-core/modules/staff-identity';
import { AuthClaimsLibModule, AuthLibModule } from '@acme-libs/auth';
import { AUTH_CLAIMS_PORT, AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { AuthStaffIdentityCoreAdapter } from '../infrastructure';
import { AuthClaimsFacade } from './auth-claims.facade';
import { AuthFacade } from './auth.facade';

@Global()
@Module({
  imports: [AuthLibModule, AuthClaimsLibModule, StaffIdentityCoreModule],
  exports: [AUTH_CLAIMS_PORT, AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_CLAIMS_PORT, useClass: AuthClaimsFacade },
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthFacade },
    AuthStaffIdentityCoreAdapter,
  ],
})
export class AuthModule {}
