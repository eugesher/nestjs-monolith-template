import { Inject, Injectable } from '@nestjs/common';

import {
  IIdentityCoreSubjectView,
  IIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type IIdentityCoreValidateSubjectRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdentityCoreValidateSubjectUseCase {
  constructor(
    @Inject(IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    query: IIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IIdentityCoreSubjectView>> {
    const { userId } = query;
    const user = await this.repository.findById(userId);

    if (!user?.isActive) {
      return undefined;
    }

    const permissions = await this.repository.findPermissionCodes(user.id);

    return { id: user.id, email: user.email, roles: [...user.roles], permissions };
  }
}
