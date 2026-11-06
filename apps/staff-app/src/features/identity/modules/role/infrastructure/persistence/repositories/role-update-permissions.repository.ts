import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IRoleUpdatePermissionsRoleRecord,
  IRoleUpdatePermissionsPermissionRecord,
  IRoleUpdatePermissionsRolePermissionInsertQuery,
  IRoleUpdatePermissionsRepositoryPort,
} from '../../../outbound';
import { RolePersistenceHost } from '../host/role-persistence.host';

@Injectable()
export class RoleUpdatePermissionsRepository
  extends RolePersistenceHost
  implements IRoleUpdatePermissionsRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findRole(name: RoleEnum): Promise<Nullable<IRoleUpdatePermissionsRoleRecord>> {
    return await this.createStaffRoleBuilder().forRole(name).getOne();
  }

  public async findPermissions(
    codes: PermissionCodeEnum[],
  ): Promise<IRoleUpdatePermissionsPermissionRecord[]> {
    if (codes.length === 0) {
      return [];
    }

    return await this.createStaffPermissionBuilder().forPermissions(codes).getMany();
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
