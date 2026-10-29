import { Inject, Injectable } from '@nestjs/common';

import { IIdentityCoreFindPermissionCodesQuery } from '@acme-core/contracts/identity';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import {
  IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  type IIdentityCoreFindPermissionCodesRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdentityCoreFindPermissionCodesUseCase {
  constructor(
    @Inject(IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreFindPermissionCodesRepositoryPort,
  ) {}

  public execute(query: IIdentityCoreFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    const { userId } = query;

    return this.repository.findPermissionCodes(userId);
  }
}
