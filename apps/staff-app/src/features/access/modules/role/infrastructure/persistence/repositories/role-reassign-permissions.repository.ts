import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IRoleReassignPermissionsRepositoryPort,
  IRoleReassignPermissionsRolePermissionInsertQuery,
  IRoleReassignPermissionsRoleRecord,
  ROLE_REASSIGN_PERMISSIONS_REPOSITORY_PORT,
} from '../../../outbound';
import { RolePersistenceHost } from '../host/role-persistence.host';

@Injectable()
export class RoleReassignPermissionsRepository
  extends RolePersistenceHost
  implements IRoleReassignPermissionsRepositoryPort
{
  public static readonly provider: ClassProvider<IRoleReassignPermissionsRepositoryPort> = {
    provide: ROLE_REASSIGN_PERMISSIONS_REPOSITORY_PORT,
    useClass: RoleReassignPermissionsRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findRole(id: string): Promise<Nullable<IRoleReassignPermissionsRoleRecord>> {
    return await this.createStaffRoleBuilder().forById(id).getOne();
  }

  public async deleteRolePermissions(roleId: string): Promise<void> {
    await this.staffRolePermissionRepository.delete({ roleId });
  }

  public async insertRolePermissions(
    queries: IRoleReassignPermissionsRolePermissionInsertQuery[],
  ): Promise<void> {
    if (queries.length === 0) {
      return;
    }

    await this.staffRolePermissionRepository.insert(queries);
  }
}
