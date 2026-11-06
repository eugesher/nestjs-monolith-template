import { Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import {
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
    private readonly staffAuthCoreFindSubject: StaffAuthCoreFindSubjectUseCase,
    private readonly staffAuthCoreFindByEmail: StaffAuthCoreFindByEmailUseCase,
  ) {}

  public async findSubject(
    command: IStaffAuthCoreFindSubjectCommand,
  ): Promise<Nullable<IStaffAuthCoreSubjectView>> {
    return await this.staffAuthCoreFindSubject.execute(command);
  }

  public async findByEmail(
    command: IStaffAuthCoreFindByEmailCommand,
  ): Promise<Nullable<IStaffAuthCoreUserView>> {
    return await this.staffAuthCoreFindByEmail.execute(command);
  }
}
