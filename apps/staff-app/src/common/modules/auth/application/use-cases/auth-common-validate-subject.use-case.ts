import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import {
  IAuthCommonSubjectView,
  IAuthCommonValidateSubjectQuery,
} from '@acme-staff/contracts/auth';

import { AuthCommonStaffUserModel } from '../../domain';
import {
  AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type IAuthCommonValidateSubjectRepositoryPort,
} from '../../outbound';

@Injectable()
export class AuthCommonValidateSubjectUseCase {
  constructor(
    @Inject(AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: IAuthCommonValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    query: IAuthCommonValidateSubjectQuery,
  ): Promise<Nullable<IAuthCommonSubjectView>> {
    const { userId } = query;
    const record = await this.repository.findActiveById(userId);

    if (!record) {
      return null;
    }

    const user = AuthCommonStaffUserModel.reconstitute(record);

    return { id: user.id, email: user.email, roles: [...user.roles] };
  }
}
