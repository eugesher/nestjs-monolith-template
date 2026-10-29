import { Inject, Injectable } from '@nestjs/common';

import { IStaffIdentityCoreFindPermissionCodesQuery } from '@acme-core/contracts/staff-identity';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import {
  STAFF_IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  type IStaffIdentityCoreFindPermissionCodesRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCoreFindPermissionCodesUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCoreFindPermissionCodesRepositoryPort,
  ) {}

  public execute(query: IStaffIdentityCoreFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    const { userId } = query;

    return this.repository.findPermissionCodes(userId);
  }
}
