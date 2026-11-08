import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IUserReassignRolesRepositoryPort,
  IUserReassignRolesStaffUserRoleInsertQuery,
  USER_REASSIGN_ROLES_REPOSITORY_PORT,
} from '../../../outbound';
import { UserPersistenceHost } from '../host/user-persistence.host';

@Injectable()
export class UserReassignRolesRepository
  extends UserPersistenceHost
  implements IUserReassignRolesRepositoryPort
{
  public static readonly provider: ClassProvider<IUserReassignRolesRepositoryPort> = {
    provide: USER_REASSIGN_ROLES_REPOSITORY_PORT,
    useClass: UserReassignRolesRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async deleteUserRolesExcept(userId: string, roleIds: string[]): Promise<void> {
    if (roleIds.length === 0) {
      await this.staffUserRoleRepository.delete({ userId });

      return;
    }

    await this.staffUserRoleRepository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId AND role_id NOT IN (:...roleIds)', { userId, roleIds })
      .execute();
  }

  public async insertUserRolesIgnore(
    queries: IUserReassignRolesStaffUserRoleInsertQuery[],
  ): Promise<void> {
    if (queries.length === 0) {
      return;
    }

    await this.staffUserRoleRepository
      .createQueryBuilder()
      .insert()
      .values(queries)
      .orIgnore()
      .execute();
  }
}
