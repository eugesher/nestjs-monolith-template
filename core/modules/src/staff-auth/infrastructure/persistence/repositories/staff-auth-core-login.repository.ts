import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  STAFF_AUTH_CORE_LOGIN_REPOSITORY_PORT,
  type IStaffAuthCoreLoginRepositoryPort,
  type IStaffAuthCoreLoginStaffUserRecord,
} from '../../../outbound';
import { StaffAuthCorePersistenceHost } from '../host/staff-auth-core-persistence.host';

@Injectable()
export class StaffAuthCoreLoginRepository
  extends StaffAuthCorePersistenceHost
  implements IStaffAuthCoreLoginRepositoryPort
{
  public static readonly provider: ClassProvider<IStaffAuthCoreLoginRepositoryPort> = {
    provide: STAFF_AUTH_CORE_LOGIN_REPOSITORY_PORT,
    useClass: StaffAuthCoreLoginRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findByEmail(email: string): Promise<Nullable<IStaffAuthCoreLoginStaffUserRecord>> {
    return await this.createStaffUserBuilder().forByEmail(email).getOne();
  }
}
