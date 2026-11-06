import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IStaffAuthCoreFindSubjectRepositoryPort,
  IStaffAuthCoreFindSubjectStaffUserRecord,
} from '../../../outbound';
import { StaffAuthCorePersistenceHost } from '../host/staff-auth-core-persistence.host';

@Injectable()
export class StaffAuthCoreFindSubjectRepository
  extends StaffAuthCorePersistenceHost
  implements IStaffAuthCoreFindSubjectRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findActiveById(
    id: string,
  ): Promise<Nullable<IStaffAuthCoreFindSubjectStaffUserRecord>> {
    return await this.createStaffUserBuilder().forActiveById(id).getOne();
  }
}
