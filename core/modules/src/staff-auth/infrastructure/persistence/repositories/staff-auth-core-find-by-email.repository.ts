import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT,
  type IStaffAuthCoreFindByEmailRepositoryPort,
  type IStaffAuthCoreFindByEmailStaffUserRecord,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findByEmail(
    email: string,
  ): Promise<Nullable<IStaffAuthCoreFindByEmailStaffUserRecord>> {
    return await this.createStaffUserBuilder().forByEmail(email).getOne();
  }
}
