import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Permission, RolePermission, User, UserRole } from '@acme-core/entities';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../../../domain';
import { IdentityCoreUserMapper } from '../../mappers/identity-core-user.mapper';

export abstract class IdentityCoreUserBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get users(): Repository<User> {
    return this.txHost.tx.getRepository(User);
  }

  private get permissions(): Repository<Permission> {
    return this.txHost.tx.getRepository(Permission);
  }

  public async findById(id: string): Promise<Maybe<IdentityCoreUserModel>> {
    const user = await this.users.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });

    return user ? IdentityCoreUserMapper.toModel(user) : undefined;
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
