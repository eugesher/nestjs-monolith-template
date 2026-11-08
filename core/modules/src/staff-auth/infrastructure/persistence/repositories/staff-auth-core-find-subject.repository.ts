import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IStaffAuthCoreFindSubjectRepositoryPort,
  IStaffAuthCoreFindSubjectStaffUserRecord,
  STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT,
} from '../../../outbound';
import { StaffAuthCorePersistenceHost } from '../host/staff-auth-core-persistence.host';

@Injectable()
export class StaffAuthCoreFindSubjectRepository
  extends StaffAuthCorePersistenceHost
  implements IStaffAuthCoreFindSubjectRepositoryPort
{
  public static readonly provider: ClassProvider<IStaffAuthCoreFindSubjectRepositoryPort> = {
    provide: STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT,
    useClass: StaffAuthCoreFindSubjectRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findActiveById(
    id: string,
  ): Promise<Nullable<IStaffAuthCoreFindSubjectStaffUserRecord>> {
    return await this.createStaffUserBuilder().forActiveById(id).getOne();
  }
}
