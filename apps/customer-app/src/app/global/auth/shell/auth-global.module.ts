import { Global, Module } from '@nestjs/common';

import { AuthJwtModule } from '@acme-libs/auth';
import { AuthAudienceEnum } from '@acme-libs/kernel';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';

import { AuthGlobalValidateSubjectUseCase } from '../application';
import { AuthGlobalValidateSubjectRepository } from '../infrastructure';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [AuthJwtModule.forRoot(AuthAudienceEnum.CUSTOMER)],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalValidateSubjectUseCase,
    AuthGlobalValidateSubjectRepository.provider,
  ],
})
export class AuthGlobalModule {}
