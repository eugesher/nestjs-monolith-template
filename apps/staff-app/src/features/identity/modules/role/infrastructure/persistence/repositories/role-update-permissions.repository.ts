import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IRoleUpdatePermissionsPermissionRecord,
  IRoleUpdatePermissionsRepositoryPort,
  IRoleUpdatePermissionsRolePermissionInsertQuery,
  IRoleUpdatePermissionsRoleRecord,
  ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT,
} from '../../../outbound';
import { RolePersistenceHost } from '../host/role-persistence.host';

@Injectable()
export class RoleUpdatePermissionsRepository
  extends RolePersistenceHost
  implements IRoleUpdatePermissionsRepositoryPort
{
  public static readonly provider: ClassProvider<IRoleUpdatePermissionsRepositoryPort> = {
    provide: ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT,
    useClass: RoleUpdatePermissionsRepository,
  };

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
