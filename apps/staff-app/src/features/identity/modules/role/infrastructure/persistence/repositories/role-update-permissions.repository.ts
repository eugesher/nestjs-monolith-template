import { Inject, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-staff/common/entities';

import { RolePermissionModel, RoleModel } from '../../../domain';
import { type IRoleUpdatePermissionsRepositoryPort } from '../../../outbound';
import { RolePermissionMapper } from '../mappers/role-permission.mapper';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleUpdatePermissionsRepository implements IRoleUpdatePermissionsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffPermissionRepository(): Repository<StaffPermission> {
    return this.repositoryHost.getRepository(StaffPermission);
  }

  private get staffRolePermissionRepository(): Repository<StaffRolePermission> {
    return this.repositoryHost.getRepository(StaffRolePermission);
  }

  private get staffRoleRepository(): Repository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  public async findRole(name: RoleEnum): Promise<Nullable<RoleModel>> {
    const role = await this.staffRoleRepository.findOne({
      where: { name },
      relations: { rolePermissions: { permission: true } },
    });

    return role ? RoleMapper.toModel(role) : null;
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
