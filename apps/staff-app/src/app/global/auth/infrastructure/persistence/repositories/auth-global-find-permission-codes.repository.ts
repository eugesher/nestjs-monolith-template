import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffPermission, StaffRolePermission, StaffUserRole } from '@acme-staff/common/entities';

import { type IAuthGlobalFindPermissionCodesRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthGlobalFindPermissionCodesRepository implements IAuthGlobalFindPermissionCodesRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get staffPermissionRepository(): Repository<StaffPermission> {
    return this.transactionHost.tx.getRepository(StaffPermission);
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
