import { Inject, Injectable } from '@nestjs/common';

import { IStaffIdentityCommonFindPermissionCodesQuery } from '@acme-staff-contracts/staff-identity';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import {
  STAFF_IDENTITY_COMMON_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  type IStaffIdentityCommonFindPermissionCodesRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCommonFindPermissionCodesUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_COMMON_FIND_PERMISSION_CODES_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCommonFindPermissionCodesRepositoryPort,
  ) {}

  public execute(
    query: IStaffIdentityCommonFindPermissionCodesQuery,
  ): Promise<PermissionCodeEnum[]> {
    const { userId } = query;

    return this.repository.findPermissionCodes(userId);
  }
}
