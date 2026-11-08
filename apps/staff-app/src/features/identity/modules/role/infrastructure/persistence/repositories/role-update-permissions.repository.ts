import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findRole(id: string): Promise<Nullable<IRoleUpdatePermissionsRoleRecord>> {
    return await this.createStaffRoleBuilder().forById(id).getOne();
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
