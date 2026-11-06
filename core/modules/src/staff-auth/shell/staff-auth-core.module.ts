import { Module } from '@nestjs/common';

import { STAFF_AUTH_CORE_PORT } from '@acme-core/contracts/staff-auth';

import { StaffAuthCoreFindByEmailUseCase, StaffAuthCoreFindSubjectUseCase } from '../application';
import {
  StaffAuthCoreFindByEmailRepository,
  StaffAuthCoreFindSubjectRepository,
} from '../infrastructure';
import { StaffAuthCoreFacade } from './staff-auth-core.facade';

@Module({
  exports: [STAFF_AUTH_CORE_PORT],
  providers: [
    { provide: STAFF_AUTH_CORE_PORT, useClass: StaffAuthCoreFacade },
    StaffAuthCoreFindSubjectUseCase,
    StaffAuthCoreFindByEmailUseCase,
    StaffAuthCoreFindSubjectRepository.provider,
    StaffAuthCoreFindByEmailRepository.provider,
  ],
})
export class StaffAuthCoreModule {}
