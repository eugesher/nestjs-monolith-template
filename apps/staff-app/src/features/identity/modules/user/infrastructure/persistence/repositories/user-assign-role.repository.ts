import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IUserAssignRoleRepositoryPort,
  IUserAssignRoleStaffRoleRecord,
  IUserAssignRoleStaffUserRecord,
  IUserAssignRoleStaffUserRoleInsertQuery,
} from '../../../outbound';
import { UserPersistenceHost } from '../host/user-persistence.host';

@Injectable()
export class UserAssignRoleRepository
  extends UserPersistenceHost
  implements IUserAssignRoleRepositoryPort
{
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
