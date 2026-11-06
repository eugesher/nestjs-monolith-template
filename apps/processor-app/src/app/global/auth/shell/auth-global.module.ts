import { Global, Module } from '@nestjs/common';

import { AuthClaimsLibModule, AuthLibModule } from '@acme-libs/auth';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { StaffAuthCoreModule } from '@acme-core/modules/staff-auth';

import { AuthGlobalValidateSubjectUseCase } from '../application';
import { AuthGlobalSubjectCoreAdapter } from '../infrastructure';
import { AUTH_GLOBAL_SUBJECT_PORT } from '../outbound';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [AuthLibModule, AuthClaimsLibModule, StaffAuthCoreModule],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalValidateSubjectUseCase,
    { provide: AUTH_GLOBAL_SUBJECT_PORT, useClass: AuthGlobalSubjectCoreAdapter },
  ],
})
export class AuthGlobalModule {}
