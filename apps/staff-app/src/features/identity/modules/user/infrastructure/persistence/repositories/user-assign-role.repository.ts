import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IUserAssignRoleRepositoryPort,
  IUserAssignRoleStaffRoleRecord,
  IUserAssignRoleStaffUserRecord,
  IUserAssignRoleStaffUserRoleInsertQuery,
  USER_ASSIGN_ROLE_REPOSITORY_PORT,
} from '../../../outbound';
import { UserPersistenceHost } from '../host/user-persistence.host';

@Injectable()
export class UserAssignRoleRepository
  extends UserPersistenceHost
  implements IUserAssignRoleRepositoryPort
{
  public static readonly provider: ClassProvider<IUserAssignRoleRepositoryPort> = {
    provide: USER_ASSIGN_ROLE_REPOSITORY_PORT,
    useClass: UserAssignRoleRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findById(id: string): Promise<Nullable<IUserAssignRoleStaffUserRecord>> {
    return await this.createStaffUserBuilder().forById(id).getOne();
  }

  public async findRole(name: string): Promise<Nullable<IUserAssignRoleStaffRoleRecord>> {
    return await this.createStaffRoleBuilder().forRole(name).getOne();
  }

  public async insertUserRole(query: IUserAssignRoleStaffUserRoleInsertQuery): Promise<void> {
    await this.staffUserRoleRepository.insert(query);
  }
}
