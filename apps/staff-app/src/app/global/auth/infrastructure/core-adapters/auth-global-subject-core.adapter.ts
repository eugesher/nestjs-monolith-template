import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { STAFF_AUTH_CORE_PORT, type IStaffAuthCorePort } from '@acme-core/contracts/staff-auth';
import type { Nullable } from '@acme-libs/toolkit';

import {
  AUTH_GLOBAL_SUBJECT_PORT,
  type IAuthGlobalSubjectFindSubjectCommand,
  type IAuthGlobalSubjectPort,
  type IAuthGlobalSubjectView,
} from '../../outbound';

@Injectable()
export class AuthGlobalSubjectCoreAdapter implements IAuthGlobalSubjectPort {
  public static readonly provider: ClassProvider<IAuthGlobalSubjectPort> = {
    provide: AUTH_GLOBAL_SUBJECT_PORT,
    useClass: AuthGlobalSubjectCoreAdapter,
  };

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
