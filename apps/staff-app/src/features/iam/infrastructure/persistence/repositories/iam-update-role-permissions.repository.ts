import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IamPermissionModel, IamRoleModel } from '../../../domain';
import { type IIamUpdateRolePermissionsRepositoryPort } from '../../../outbound';
import { IamPermissionMapper } from '../mappers/iam-permission.mapper';
import { IamRoleMapper } from '../mappers/iam-role.mapper';

@Injectable()
export class IamUpdateRolePermissionsRepository implements IIamUpdateRolePermissionsRepositoryPort {
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

  public async findRole(name: RoleEnum): Promise<Maybe<IamRoleModel>> {
    const role = await this.roles.findOne({
      where: { name },
      relations: { rolePermissions: { permission: true } },
    });

    return role ? IamRoleMapper.toModel(role) : undefined;
  }

  public async findPermissions(codes: PermissionCodeEnum[]): Promise<IamPermissionModel[]> {
    if (codes.length === 0) {
      return [];
    }

    const permissions = await this.permissions.find({ where: { code: In(codes) } });

    return permissions.map((permission) => IamPermissionMapper.toModel(permission));
  }

  public async replacePermissions(role: IamRoleModel): Promise<void> {
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
