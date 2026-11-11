import { Injectable } from '@nestjs/common';

import type { Nullable } from '@acme-libs/toolkit';
import type {
  IStaffAuthCoreFindByEmailCommand,
  IStaffAuthCoreFindSubjectCommand,
  IStaffAuthCorePort,
  IStaffAuthCoreSubjectView,
  IStaffAuthCoreUserView,
} from '@acme-core/contracts/staff-auth';

import { StaffAuthCoreFindByEmailUseCase, StaffAuthCoreFindSubjectUseCase } from '../application';

@Injectable()
export class StaffAuthCoreFacade implements IStaffAuthCorePort {
  constructor(
    private readonly findSubject: StaffAuthCoreFindSubjectUseCase,
    private readonly findByEmail: StaffAuthCoreFindByEmailUseCase,
  ) {}

  public async handleFindSubject(
    command: IStaffAuthCoreFindSubjectCommand,
  ): Promise<Nullable<IStaffAuthCoreSubjectView>> {
    return await this.findSubject.execute(command);
  }

  public async handleFindByEmail(
    command: IStaffAuthCoreFindByEmailCommand,
  ): Promise<Nullable<IStaffAuthCoreUserView>> {
    return await this.findByEmail.execute(command);
  }
}
