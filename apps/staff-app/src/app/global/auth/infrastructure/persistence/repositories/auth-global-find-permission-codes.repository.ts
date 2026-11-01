import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffPermission, StaffRolePermission, StaffUserRole } from '@acme-staff/common/entities';

import { type IAuthGlobalFindPermissionCodesRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthGlobalFindPermissionCodesRepository implements IAuthGlobalFindPermissionCodesRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get staffPermissionRepository(): Repository<StaffPermission> {
    return this.repositoryHost.getRepository(StaffPermission);
  }

  public async findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]> {
    const rows = await this.staffPermissionRepository
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
      .getRawMany<{ code: PermissionCodeEnum }>();

    return rows.map((row) => row.code);
  }
}
