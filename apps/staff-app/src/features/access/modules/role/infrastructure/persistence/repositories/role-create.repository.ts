import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IRoleCreateRepositoryPort,
  IRoleCreateRolePermissionInsertQuery,
  IRoleCreateStaffRoleInsertQuery,
  ROLE_CREATE_REPOSITORY_PORT,
} from '../../../outbound';
import { RolePersistenceHost } from '../host/role-persistence.host';

@Injectable()
export class RoleCreateRepository extends RolePersistenceHost implements IRoleCreateRepositoryPort {
  public static readonly provider: ClassProvider<IRoleCreateRepositoryPort> = {
    provide: ROLE_CREATE_REPOSITORY_PORT,
    useClass: RoleCreateRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async insertRole(query: IRoleCreateStaffRoleInsertQuery): Promise<string> {
    return await this.staffRoleRepository.insertOne(query);
  }

  public async insertRolePermissions(
    queries: IRoleCreateRolePermissionInsertQuery[],
  ): Promise<void> {
    if (queries.length === 0) {
      return;
    }

    await this.staffRolePermissionRepository.insert(queries);
  }
}
