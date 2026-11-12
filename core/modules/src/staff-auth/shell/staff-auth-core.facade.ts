import { Injectable } from '@nestjs/common';

import type { Nullable } from '@acme-libs/toolkit';
import type {
  IStaffAuthCoreFindSubjectCommand,
  IStaffAuthCoreLoginCommand,
  IStaffAuthCoreLoginView,
  IStaffAuthCorePort,
  IStaffAuthCoreSubjectView,
} from '@acme-core/contracts/staff-auth';

import { StaffAuthCoreFindSubjectUseCase, StaffAuthCoreLoginUseCase } from '../application';

@Injectable()
export class StaffAuthCoreFacade implements IStaffAuthCorePort {
  constructor(
    private readonly findSubject: StaffAuthCoreFindSubjectUseCase,
    private readonly login: StaffAuthCoreLoginUseCase,
  ) {}

  public async handleFindSubject(
    command: IStaffAuthCoreFindSubjectCommand,
  ): Promise<Nullable<IStaffAuthCoreSubjectView>> {
    return await this.findSubject.execute(command);
  }

  public async handleLogin(command: IStaffAuthCoreLoginCommand): Promise<IStaffAuthCoreLoginView> {
    return await this.login.execute(command);
  }
}
