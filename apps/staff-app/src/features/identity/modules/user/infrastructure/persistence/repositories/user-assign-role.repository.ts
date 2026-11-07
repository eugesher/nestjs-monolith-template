import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findById(id: string): Promise<Nullable<IUserAssignRoleStaffUserRecord>> {
    return await this.createStaffUserBuilder().forById(id).getOne();
  }

  public async findRole(name: RoleEnum): Promise<Nullable<IUserAssignRoleStaffRoleRecord>> {
    return await this.createStaffRoleBuilder().forRole(name).getOne();
  }

  public async insertUserRole(query: IUserAssignRoleStaffUserRoleInsertQuery): Promise<void> {
    await this.staffUserRoleRepository.insert(query);
  }
}
