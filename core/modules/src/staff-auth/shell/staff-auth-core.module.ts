import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { AuthAudienceEnum } from '@acme-libs/kernel';
import { STAFF_AUTH_CORE_PORT } from '@acme-core/contracts/staff-auth';

import { StaffAuthCoreFindSubjectUseCase, StaffAuthCoreLoginUseCase } from '../application';
import {
  StaffAuthCoreCredentialsLibAdapter,
  StaffAuthCoreFindSubjectRepository,
  StaffAuthCoreLoginRepository,
} from '../infrastructure';
import { StaffAuthCoreFacade } from './staff-auth-core.facade';

@Module({
  imports: [CredentialsLibModule.register(AuthAudienceEnum.STAFF)],
  exports: [STAFF_AUTH_CORE_PORT],
  providers: [
    { provide: STAFF_AUTH_CORE_PORT, useClass: StaffAuthCoreFacade },
    StaffAuthCoreFindSubjectUseCase,
    StaffAuthCoreLoginUseCase,
    StaffAuthCoreFindSubjectRepository.provider,
    StaffAuthCoreLoginRepository.provider,
    StaffAuthCoreCredentialsLibAdapter.provider,
  ],
})
export class StaffAuthCoreModule {}
