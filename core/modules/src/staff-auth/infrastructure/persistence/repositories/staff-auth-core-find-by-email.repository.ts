import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IStaffAuthCoreFindByEmailRepositoryPort,
  IStaffAuthCoreFindByEmailStaffUserRecord,
  STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT,
} from '../../../outbound';
import { StaffAuthCorePersistenceHost } from '../host/staff-auth-core-persistence.host';

@Injectable()
export class StaffAuthCoreFindByEmailRepository
  extends StaffAuthCorePersistenceHost
  implements IStaffAuthCoreFindByEmailRepositoryPort
{
  public static readonly provider: ClassProvider<IStaffAuthCoreFindByEmailRepositoryPort> = {
    provide: STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT,
    useClass: StaffAuthCoreFindByEmailRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findByEmail(
    email: string,
  ): Promise<Nullable<IStaffAuthCoreFindByEmailStaffUserRecord>> {
    return await this.createStaffUserBuilder().forByEmail(email).getOne();
  }
}
