import { Global, Module } from '@nestjs/common';

import { StaffIdentityCoreModule } from '@acme-core/modules/staff-identity';
import { AuthClaimsLibModule, AuthLibModule } from '@acme-libs/auth';
import { AUTH_CLAIMS_PORT, AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { AuthGlobalStaffIdentityCoreAdapter } from '../infrastructure';
import { AuthGlobalClaimsFacade } from './auth-global-claims.facade';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [AuthLibModule, AuthClaimsLibModule, StaffIdentityCoreModule],
  exports: [AUTH_CLAIMS_PORT, AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_CLAIMS_PORT, useClass: AuthGlobalClaimsFacade },
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalStaffIdentityCoreAdapter,
  ],
})
export class AuthGlobalModule {}
