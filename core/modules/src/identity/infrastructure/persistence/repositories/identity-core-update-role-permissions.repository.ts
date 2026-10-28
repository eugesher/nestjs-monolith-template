import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { Permission, Role, RolePermission } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCorePermissionModel, IdentityCoreRoleModel } from '../../../domain';
import { type IIdentityCoreUpdateRolePermissionsRepositoryPort } from '../../../outbound';
import { IdentityCorePermissionMapper } from '../mappers/identity-core-permission.mapper';
import { IdentityCoreRoleMapper } from '../mappers/identity-core-role.mapper';

@Injectable()
export class IdentityCoreUpdateRolePermissionsRepository implements IIdentityCoreUpdateRolePermissionsRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get permissions(): Repository<Permission> {
    return this.txHost.tx.getRepository(Permission);
  }

  private get rolePermissions(): Repository<RolePermission> {
    return this.txHost.tx.getRepository(RolePermission);
  }

  private get roles(): Repository<Role> {
    return this.txHost.tx.getRepository(Role);
  }

  public async findRole(name: RoleEnum): Promise<Maybe<IdentityCoreRoleModel>> {
    const role = await this.roles.findOne({
      where: { name },
      relations: { rolePermissions: { permission: true } },
    });

    return role ? IdentityCoreRoleMapper.toModel(role) : undefined;
  }

  public async findPermissions(
    codes: PermissionCodeEnum[],
  ): Promise<IdentityCorePermissionModel[]> {
    if (codes.length === 0) {
      return [];
    }

    const permissions = await this.permissions.find({ where: { code: In(codes) } });

    return permissions.map((permission) => IdentityCorePermissionMapper.toModel(permission));
  }

  public async replacePermissions(role: IdentityCoreRoleModel): Promise<void> {
    await this.rolePermissions.delete({ roleId: role.id });

    const permissions = await this.findPermissions([...role.permissionCodes]);
    const rows = permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    }));

    if (rows.length > 0) {
      await this.rolePermissions.insert(rows);
    }
  }
}
