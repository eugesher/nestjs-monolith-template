import { Module } from '@nestjs/common';

import { AUTH_COMMON_PORT } from '@acme-staff-contracts/auth';
import { AuthCommonValidateSubjectUseCase } from '../application';
import { AuthCommonTypeOrmModule, AuthCommonValidateSubjectRepository } from '../infrastructure';
import { AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT } from '../outbound';
import { AuthCommonFacade } from './auth-common.facade';

@Module({
  imports: [AuthCommonTypeOrmModule.forFeature()],
  exports: [AUTH_COMMON_PORT],
  providers: [
    { provide: AUTH_COMMON_PORT, useClass: AuthCommonFacade },
    AuthCommonValidateSubjectUseCase,
    {
      provide: AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
      useClass: AuthCommonValidateSubjectRepository,
    },
  ],
})
export class AuthCommonModule {}
