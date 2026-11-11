import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { STAFF_AUTH_CORE_PORT, type IStaffAuthCorePort } from '@acme-core/contracts/staff-auth';
import type { Nullable } from '@acme-libs/toolkit';

import {
  AUTH_IDENTITY_PORT,
  type IAuthIdentityFindByEmailCommand,
  type IAuthIdentityPort,
  type IAuthIdentityUserView,
} from '../../outbound';

@Injectable()
export class AuthIdentityCoreAdapter implements IAuthIdentityPort {
  public static readonly provider: ClassProvider<IAuthIdentityPort> = {
    provide: AUTH_IDENTITY_PORT,
    useClass: AuthIdentityCoreAdapter,
  };

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
