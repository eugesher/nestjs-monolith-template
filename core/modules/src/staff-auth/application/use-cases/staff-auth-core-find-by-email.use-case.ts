import { Inject, Injectable } from '@nestjs/common';

import type { Nullable } from '@acme-libs/toolkit';
import type {
  IStaffAuthCoreFindByEmailCommand,
  IStaffAuthCoreUserView,
} from '@acme-core/contracts/staff-auth';

import {
  STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT,
  type IStaffAuthCoreFindByEmailRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffAuthCoreFindByEmailUseCase {
  constructor(
    @Inject(STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT)
    private readonly repository: IStaffAuthCoreFindByEmailRepositoryPort,
  ) {}

  public async execute(
    command: IStaffAuthCoreFindByEmailCommand,
  ): Promise<Nullable<IStaffAuthCoreUserView>> {
    const { email } = command;

    return await this.repository.findByEmail(email);
  }
}
