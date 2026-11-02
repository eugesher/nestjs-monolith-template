import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffRole } from '@acme-staff/common/entities';

import { RoleModel } from '../../../domain';
import { IRoleListRepositoryPort } from '../../../outbound';

@Injectable()
export class RoleListRepository implements IRoleListRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffRoleRepository(): IHostedRepository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  public async list(): Promise<RoleModel[]> {
    const roles = await this.staffRoleRepository
      .createQueryBuilder('StaffRole')
      .select(['StaffRole.id', 'StaffRole.name'])
      .leftJoin('StaffRole.rolePermissions', 'StaffRolePermission')
      .addSelect(['StaffRolePermission.roleId', 'StaffRolePermission.permissionId'])
      .leftJoin('StaffRolePermission.permission', 'StaffPermission')
      .addSelect(['StaffPermission.id', 'StaffPermission.code'])
      .orderBy('StaffRole.id', 'ASC')
      .getMany();

    return roles.map((role) =>
      RoleModel.reconstitute({
        id: role.id,
        name: role.name as RoleEnum,
        permissionCodes: role.rolePermissions
          .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
          .sort(),
      }),
    );
  }
}
