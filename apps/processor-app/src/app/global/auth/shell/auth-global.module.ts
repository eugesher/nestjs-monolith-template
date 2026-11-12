import { Global, Module } from '@nestjs/common';

import { AuthJwtModule, AuthPermissionModule } from '@acme-libs/auth';
import { AuthAudienceEnum } from '@acme-libs/kernel';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { StaffAuthCoreModule } from '@acme-core/modules/staff-auth';

import { AuthGlobalValidateSubjectUseCase } from '../application';
import { AuthGlobalSubjectCoreAdapter } from '../infrastructure';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [
    AuthJwtModule.forRoot(AuthAudienceEnum.STAFF),
    AuthPermissionModule,
    StaffAuthCoreModule,
  ],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalValidateSubjectUseCase,
    AuthGlobalSubjectCoreAdapter.provider,
  ],
})
export class AuthGlobalModule {}
