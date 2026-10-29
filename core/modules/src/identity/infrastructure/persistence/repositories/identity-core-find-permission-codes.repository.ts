import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Permission, RolePermission, UserRole } from '@acme-core/entities';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { type IIdentityCoreFindPermissionCodesRepositoryPort } from '../../../outbound';

@Injectable()
export class IdentityCoreFindPermissionCodesRepository implements IIdentityCoreFindPermissionCodesRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get permissions(): Repository<Permission> {
    return this.txHost.tx.getRepository(Permission);
  }

  public async findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]> {
    const rows = await this.permissions
      .createQueryBuilder('permission')
      .select('permission.code', 'code')
      .distinct(true)
      .innerJoin(RolePermission, 'rolePermission', 'rolePermission.permissionId = permission.id')
      .innerJoin(UserRole, 'userRole', 'userRole.roleId = rolePermission.roleId')
      .where('userRole.userId = :userId', { userId })
      .orderBy('permission.code')
      .getRawMany<{ code: PermissionCodeEnum }>();

    return rows.map((row) => row.code);
  }
}
