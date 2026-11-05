import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { StaffPermission, StaffRolePermission, StaffUserRole } from '@acme-staff/common/entities';

import {
  IAuthGlobalFindPermissionCodesRepositoryPort,
  IAuthGlobalFindPermissionCodesRecord,
} from '../../../outbound';

@Injectable()
export class AuthGlobalFindPermissionCodesRepository implements IAuthGlobalFindPermissionCodesRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffPermissionRepository(): IHostedRepository<StaffPermission> {
    return this.repositoryHost.getRepository(StaffPermission);
  }

  public async findPermissionCodes(
    userId: string,
  ): Promise<IAuthGlobalFindPermissionCodesRecord[]> {
    return await this.staffPermissionRepository
      .createQueryBuilder('StaffPermission')
      .select('StaffPermission.code', 'code')
      .distinct(true)
      .innerJoin(
        StaffRolePermission,
        'StaffRolePermission',
        'StaffRolePermission.permissionId = StaffPermission.id',
      )
      .innerJoin(
        StaffUserRole,
        'StaffUserRole',
        'StaffUserRole.roleId = StaffRolePermission.roleId',
      )
      .where('StaffUserRole.userId = :userId', { userId })
      .orderBy('StaffPermission.code')
      .getRawMany<IAuthGlobalFindPermissionCodesRecord>();
  }
}
