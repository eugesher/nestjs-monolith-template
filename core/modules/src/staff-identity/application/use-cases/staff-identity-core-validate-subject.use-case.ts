import { Inject, Injectable } from '@nestjs/common';

import {
  IStaffIdentityCoreSubjectView,
  IStaffIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/staff-identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  STAFF_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type IStaffIdentityCoreValidateSubjectRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCoreValidateSubjectUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCoreValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    query: IStaffIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IStaffIdentityCoreSubjectView>> {
    const { userId } = query;
    const user = await this.repository.findById(userId);

    if (!user?.isActive) {
      return undefined;
    }

    return { id: user.id, email: user.email, roles: [...user.roles] };
  }
}
