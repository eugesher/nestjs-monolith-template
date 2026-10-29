import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCorePermissionModel, StaffIdentityCoreRoleModel } from '../../../domain';
import { type IStaffIdentityCoreUpdateRolePermissionsRepositoryPort } from '../../../outbound';
import { StaffIdentityCorePermissionMapper } from '../mappers/staff-identity-core-permission.mapper';
import { StaffIdentityCoreRoleMapper } from '../mappers/staff-identity-core-role.mapper';

@Injectable()
export class StaffIdentityCoreUpdateRolePermissionsRepository implements IStaffIdentityCoreUpdateRolePermissionsRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get permissions(): Repository<StaffPermission> {
    return this.txHost.tx.getRepository(StaffPermission);
  }

  private get rolePermissions(): Repository<StaffRolePermission> {
    return this.txHost.tx.getRepository(StaffRolePermission);
  }

  private get roles(): Repository<StaffRole> {
    return this.txHost.tx.getRepository(StaffRole);
  }

  public async findRole(name: RoleEnum): Promise<Maybe<StaffIdentityCoreRoleModel>> {
    const role = await this.roles.findOne({
      where: { name },
      relations: { rolePermissions: { permission: true } },
    });

    return role ? StaffIdentityCoreRoleMapper.toModel(role) : undefined;
  }

  public async findPermissions(
    codes: PermissionCodeEnum[],
  ): Promise<StaffIdentityCorePermissionModel[]> {
    if (codes.length === 0) {
      return [];
    }

    const permissions = await this.permissions.find({ where: { code: In(codes) } });

    return permissions.map((permission) => StaffIdentityCorePermissionMapper.toModel(permission));
  }

  public async replacePermissions(role: StaffIdentityCoreRoleModel): Promise<void> {
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
