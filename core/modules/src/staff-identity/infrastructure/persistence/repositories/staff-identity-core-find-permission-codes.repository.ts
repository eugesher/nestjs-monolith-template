import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffPermission, StaffRolePermission, StaffUserRole } from '@acme-core/entities';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { type IStaffIdentityCoreFindPermissionCodesRepositoryPort } from '../../../outbound';

@Injectable()
export class StaffIdentityCoreFindPermissionCodesRepository implements IStaffIdentityCoreFindPermissionCodesRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get permissions(): Repository<StaffPermission> {
    return this.txHost.tx.getRepository(StaffPermission);
  }

  public async findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]> {
    const rows = await this.permissions
      .createQueryBuilder('permission')
      .select('permission.code', 'code')
      .distinct(true)
      .innerJoin(
        StaffRolePermission,
        'rolePermission',
        'rolePermission.permissionId = permission.id',
      )
      .innerJoin(StaffUserRole, 'userRole', 'userRole.roleId = rolePermission.roleId')
      .where('userRole.userId = :userId', { userId })
      .orderBy('permission.code')
      .getRawMany<{ code: PermissionCodeEnum }>();

    return rows.map((row) => row.code);
  }
}
