import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { type IStaffAuthCorePort, STAFF_AUTH_CORE_PORT } from '@acme-core/contracts/staff-auth';

import {
  IAuthGlobalSubjectFindSubjectCommand,
  IAuthGlobalSubjectPort,
  IAuthGlobalSubjectView,
} from '../../outbound';

@Injectable()
export class AuthGlobalSubjectCoreAdapter implements IAuthGlobalSubjectPort {
  constructor(
    @Inject(STAFF_AUTH_CORE_PORT)
    private readonly staffAuthCore: IStaffAuthCorePort,
  ) {}

  public async findSubject(
    command: IAuthGlobalSubjectFindSubjectCommand,
  ): Promise<Nullable<IAuthGlobalSubjectView>> {
    const { userId } = command;

    return await this.staffAuthCore.handleFindSubject({ userId });
  }
}
