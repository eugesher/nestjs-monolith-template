import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-staff/common/entities';

import {
  IRoleUpdatePermissionsRoleRecord,
  IRoleUpdatePermissionsPermissionRecord,
  IRoleUpdatePermissionsRolePermissionInsertQuery,
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

  public async findRole(name: RoleEnum): Promise<Nullable<IRoleUpdatePermissionsRoleRecord>> {
    return await this.staffRoleRepository
      .createQueryBuilder('StaffRole')
      .select(['StaffRole.id', 'StaffRole.name'])
      .leftJoin('StaffRole.rolePermissions', 'StaffRolePermission')
      .addSelect(['StaffRolePermission.roleId', 'StaffRolePermission.permissionId'])
      .leftJoin('StaffRolePermission.permission', 'StaffPermission')
      .addSelect(['StaffPermission.id', 'StaffPermission.code'])
      .where('StaffRole.name = :name', { name })
      .getOne();
  }

  public async findPermissions(
    codes: PermissionCodeEnum[],
  ): Promise<IRoleUpdatePermissionsPermissionRecord[]> {
    if (codes.length === 0) {
      return [];
    }

    return await this.staffPermissionRepository
      .createQueryBuilder('StaffPermission')
      .select(['StaffPermission.id', 'StaffPermission.code'])
      .where('StaffPermission.code IN (:...codes)', { codes })
      .getMany();
  }

  public async deleteRolePermissions(roleId: string): Promise<void> {
    await this.staffRolePermissionRepository.delete({ roleId });
  }

  public async insertRolePermissions(
    queries: IRoleUpdatePermissionsRolePermissionInsertQuery[],
  ): Promise<void> {
    if (queries.length === 0) {
      return;
    }

    await this.staffRolePermissionRepository.insert(queries);
  }
}
