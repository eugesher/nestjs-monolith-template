import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { type IStaffAuthCorePort, STAFF_AUTH_CORE_PORT } from '@acme-core/contracts/staff-auth';

import {
  IAuthIdentityFindByEmailCommand,
  IAuthIdentityPort,
  IAuthIdentityUserView,
} from '../../outbound';

@Injectable()
export class AuthIdentityCoreAdapter implements IAuthIdentityPort {
  constructor(
    @Inject(STAFF_AUTH_CORE_PORT)
    private readonly staffAuthCore: IStaffAuthCorePort,
  ) {}

  public async findByEmail(
    command: IAuthIdentityFindByEmailCommand,
  ): Promise<Nullable<IAuthIdentityUserView>> {
    const { email } = command;

    return await this.staffAuthCore.handleFindByEmail({ email });
  }
}
