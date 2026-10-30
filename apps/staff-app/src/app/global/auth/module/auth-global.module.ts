import { Global, Module } from '@nestjs/common';

import { AuthCommonModule } from '@acme-staff-common/modules/auth';
import { AuthClaimsLibModule, AuthLibModule } from '@acme-libs/auth';
import { AUTH_CLAIMS_PORT, AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import {
  AuthGlobalFindPermissionCodesUseCase,
  AuthGlobalFindRolesUseCase,
  AuthGlobalValidateSubjectUseCase,
} from '../application';
import {
  AuthGlobalFindPermissionCodesRepository,
  AuthGlobalSubjectCommonAdapter,
  AuthGlobalTypeOrmModule,
} from '../infrastructure';
import {
  AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  AUTH_GLOBAL_SUBJECT_PORT,
} from '../outbound';
import { AuthGlobalClaimsFacade } from './auth-global-claims.facade';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [
    AuthGlobalTypeOrmModule.forFeature(),
    AuthLibModule,
    AuthClaimsLibModule,
    AuthCommonModule,
  ],
  exports: [AUTH_CLAIMS_PORT, AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_CLAIMS_PORT, useClass: AuthGlobalClaimsFacade },
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalFindPermissionCodesUseCase,
    AuthGlobalFindRolesUseCase,
    AuthGlobalValidateSubjectUseCase,
    {
      provide: AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT,
      useClass: AuthGlobalFindPermissionCodesRepository,
    },
    { provide: AUTH_GLOBAL_SUBJECT_PORT, useClass: AuthGlobalSubjectCommonAdapter },
  ],
})
export class AuthGlobalModule {}
