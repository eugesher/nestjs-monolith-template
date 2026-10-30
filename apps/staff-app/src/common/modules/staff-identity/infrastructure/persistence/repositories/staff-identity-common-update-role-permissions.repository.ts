import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCommonPermissionModel, StaffIdentityCommonRoleModel } from '../../../domain';
import { type IStaffIdentityCommonUpdateRolePermissionsRepositoryPort } from '../../../outbound';
import { StaffIdentityCommonPermissionMapper } from '../mappers/staff-identity-common-permission.mapper';
import { StaffIdentityCommonRoleMapper } from '../mappers/staff-identity-common-role.mapper';

@Injectable()
export class StaffIdentityCommonUpdateRolePermissionsRepository implements IStaffIdentityCommonUpdateRolePermissionsRepositoryPort {
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

  public async findRole(name: RoleEnum): Promise<Maybe<StaffIdentityCommonRoleModel>> {
    const role = await this.roles.findOne({
      where: { name },
      relations: { rolePermissions: { permission: true } },
    });

    return role ? StaffIdentityCommonRoleMapper.toModel(role) : undefined;
  }

  public async findPermissions(
    codes: PermissionCodeEnum[],
  ): Promise<StaffIdentityCommonPermissionModel[]> {
    if (codes.length === 0) {
      return [];
    }

    const permissions = await this.permissions.find({ where: { code: In(codes) } });

    return permissions.map((permission) => StaffIdentityCommonPermissionMapper.toModel(permission));
  }

  public async replacePermissions(role: StaffIdentityCommonRoleModel): Promise<void> {
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
