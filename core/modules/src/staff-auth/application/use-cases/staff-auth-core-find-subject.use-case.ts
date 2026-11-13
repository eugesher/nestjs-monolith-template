import { Inject, Injectable } from '@nestjs/common';

import type { Nullable } from '@acme-libs/toolkit';
import type {
  IStaffAuthCoreFindSubjectCommand,
  IStaffAuthCoreSubjectView,
} from '@acme-core/contracts/staff-auth';

import { StaffAuthCoreSubjectModel } from '../../domain';
import {
  STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT,
  type IStaffAuthCoreFindSubjectRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffAuthCoreFindSubjectUseCase {
  constructor(
    @Inject(STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT)
    private readonly repository: IStaffAuthCoreFindSubjectRepositoryPort,
  ) {}

  public async execute(
    command: IStaffAuthCoreFindSubjectCommand,
  ): Promise<Nullable<IStaffAuthCoreSubjectView>> {
    const { userId } = command;
    const userRecord = await this.repository.findActiveById(userId);

    if (!userRecord) {
      return null;
    }

    const subject = StaffAuthCoreSubjectModel.reconstitute(userRecord);

    return {
      id: subject.id,
      email: subject.email,
      roles: [...subject.roles],
      permissionCodes: [...subject.permissionCodes],
    };
  }
}
