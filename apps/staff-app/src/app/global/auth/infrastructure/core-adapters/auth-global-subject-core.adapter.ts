import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { type IStaffAuthCorePort, STAFF_AUTH_CORE_PORT } from '@acme-core/contracts/staff-auth';

import {
  IAuthGlobalSubjectFindSubjectCommand,
  IAuthGlobalSubjectPort,
  IAuthGlobalSubjectView,
  AUTH_GLOBAL_SUBJECT_PORT,
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
