import { Global, Module } from '@nestjs/common';

import { AuthLibModule } from '@acme-libs/auth';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { AuthGlobalValidateSubjectUseCase } from '../application';
import { AuthGlobalTypeOrmModule, AuthGlobalValidateSubjectRepository } from '../infrastructure';
import { AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT } from '../outbound';
import { AuthGlobalFacade } from './auth-global.facade';

@Global()
@Module({
  imports: [AuthGlobalTypeOrmModule.forFeature(), AuthLibModule],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [
    { provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthGlobalFacade },
    AuthGlobalValidateSubjectUseCase,
    {
      provide: AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT,
      useClass: AuthGlobalValidateSubjectRepository,
    },
  ],
})
export class AuthGlobalModule {}
