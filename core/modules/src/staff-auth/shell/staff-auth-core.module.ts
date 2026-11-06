import { Module } from '@nestjs/common';

import { STAFF_AUTH_CORE_PORT } from '@acme-core/contracts/staff-auth';

import { StaffAuthCoreFindByEmailUseCase, StaffAuthCoreFindSubjectUseCase } from '../application';
import {
  StaffAuthCoreFindByEmailRepository,
  StaffAuthCoreFindSubjectRepository,
} from '../infrastructure';
import {
  STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT,
  STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT,
} from '../outbound';
import { StaffAuthCoreFacade } from './staff-auth-core.facade';

@Module({
  exports: [STAFF_AUTH_CORE_PORT],
  providers: [
    { provide: STAFF_AUTH_CORE_PORT, useClass: StaffAuthCoreFacade },
    StaffAuthCoreFindSubjectUseCase,
    StaffAuthCoreFindByEmailUseCase,
    {
      provide: STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT,
      useClass: StaffAuthCoreFindSubjectRepository,
    },
    {
      provide: STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT,
      useClass: StaffAuthCoreFindByEmailRepository,
    },
  ],
})
export class StaffAuthCoreModule {}
