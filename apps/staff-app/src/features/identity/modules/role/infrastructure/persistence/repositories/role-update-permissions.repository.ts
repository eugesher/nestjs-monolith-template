import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { RolePermissionModel, RoleModel } from '../../../domain';
import { type IRoleUpdatePermissionsRepositoryPort } from '../../../outbound';
import { RolePermissionMapper } from '../mappers/role-permission.mapper';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleUpdatePermissionsRepository implements IRoleUpdatePermissionsRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get staffPermissionRepository(): Repository<StaffPermission> {
    return this.transactionHost.tx.getRepository(StaffPermission);
  }

  private get staffRolePermissionRepository(): Repository<StaffRolePermission> {
    return this.transactionHost.tx.getRepository(StaffRolePermission);
  }

  private get staffRoleRepository(): Repository<StaffRole> {
    return this.transactionHost.tx.getRepository(StaffRole);
  }

  public async findRole(name: RoleEnum): Promise<Maybe<RoleModel>> {
    const role = await this.staffRoleRepository.findOne({
      where: { name },
      relations: { rolePermissions: { permission: true } },
    });

    return role ? RoleMapper.toModel(role) : undefined;
  }

  public async findPermissions(codes: PermissionCodeEnum[]): Promise<RolePermissionModel[]> {
    if (codes.length === 0) {
      return [];
    }

    const permissions = await this.staffPermissionRepository.find({ where: { code: In(codes) } });

    return permissions.map((permission) => RolePermissionMapper.toModel(permission));
  }

  public async replacePermissions(role: RoleModel): Promise<void> {
    await this.staffRolePermissionRepository.delete({ roleId: role.id });

    const permissions = await this.findPermissions([...role.permissionCodes]);
    const rows = permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    }));

    if (rows.length > 0) {
      await this.staffRolePermissionRepository.insert(rows);
    }
  }
}
