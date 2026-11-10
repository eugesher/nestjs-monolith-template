import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IRoleCreateRepositoryPort,
  IRoleCreateRolePermissionInsertQuery,
  IRoleCreateStaffRoleInsertQuery,
  IRoleCreateStaffRoleInsertRecord,
  ROLE_CREATE_REPOSITORY_PORT,
  RoleCreateStaffRoleInsertOutcomeEnum,
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

  public async insertRole(
    query: IRoleCreateStaffRoleInsertQuery,
  ): Promise<IRoleCreateStaffRoleInsertRecord> {
    try {
      const id = await this.staffRoleRepository.insertOne(query);

      return { outcome: RoleCreateStaffRoleInsertOutcomeEnum.INSERTED, id };
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return { outcome: RoleCreateStaffRoleInsertOutcomeEnum.DUPLICATE };
      }

      throw error;
    }
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
