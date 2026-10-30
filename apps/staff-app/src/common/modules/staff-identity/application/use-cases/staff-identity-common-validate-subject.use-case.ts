import { Inject, Injectable } from '@nestjs/common';

import {
  IStaffIdentityCommonSubjectView,
  IStaffIdentityCommonValidateSubjectQuery,
} from '@acme-staff-contracts/staff-identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  STAFF_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type IStaffIdentityCommonValidateSubjectRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCommonValidateSubjectUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCommonValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    query: IStaffIdentityCommonValidateSubjectQuery,
  ): Promise<Maybe<IStaffIdentityCommonSubjectView>> {
    const { userId } = query;
    const user = await this.repository.findById(userId);

    if (!user?.isActive) {
      return undefined;
    }

    return { id: user.id, email: user.email, roles: [...user.roles] };
  }
}
