import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-staff/common/entities';

import { RoleModel, RolePermissionModel } from '../../../domain';
import {
  IRoleReplacePermissionsCommand,
  IRoleUpdatePermissionsRepositoryPort,
} from '../../../outbound';

@Injectable()
export class RoleUpdatePermissionsRepository implements IRoleUpdatePermissionsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffPermissionRepository(): IHostedRepository<StaffPermission> {
    return this.repositoryHost.getRepository(StaffPermission);
  }

  private get staffRolePermissionRepository(): IHostedRepository<StaffRolePermission> {
    return this.repositoryHost.getRepository(StaffRolePermission);
  }

  private get staffRoleRepository(): IHostedRepository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  public async findRole(name: RoleEnum): Promise<Nullable<RoleModel>> {
    const role = await this.staffRoleRepository
      .createQueryBuilder('StaffRole')
      .select(['StaffRole.id', 'StaffRole.name'])
      .leftJoin('StaffRole.rolePermissions', 'StaffRolePermission')
      .addSelect(['StaffRolePermission.roleId', 'StaffRolePermission.permissionId'])
      .leftJoin('StaffRolePermission.permission', 'StaffPermission')
      .addSelect(['StaffPermission.id', 'StaffPermission.code'])
      .where('StaffRole.name = :name', { name })
      .getOne();

    if (!role) {
      return null;
    }

    const permissionCodes = role.rolePermissions
      .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
      .sort();

    return RoleModel.reconstitute({ id: role.id, name: role.name as RoleEnum, permissionCodes });
  }

  public async findPermissions(codes: PermissionCodeEnum[]): Promise<RolePermissionModel[]> {
    if (codes.length === 0) {
      return [];
    }

    const permissions = await this.staffPermissionRepository
      .createQueryBuilder('StaffPermission')
      .select(['StaffPermission.id', 'StaffPermission.code'])
      .where('StaffPermission.code IN (:...codes)', { codes })
      .getMany();

    return permissions.map((permission) =>
      RolePermissionModel.reconstitute({
        id: permission.id,
        code: permission.code as PermissionCodeEnum,
      }),
    );
  }

  public async replacePermissions(command: IRoleReplacePermissionsCommand): Promise<void> {
    const { role, permissions } = command;

    await this.staffRolePermissionRepository.delete({ roleId: role.id });

    const rows = permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    }));

    if (rows.length > 0) {
      await this.staffRolePermissionRepository.insert(rows);
    }
  }
}
