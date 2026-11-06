import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { RoleEnum } from '@acme-libs/kernel';

import {
  IUserRegisterRepositoryPort,
  IUserRegisterStaffRoleRecord,
  IUserRegisterStaffUserInsertQuery,
  IUserRegisterStaffUserRoleInsertQuery,
  USER_REGISTER_REPOSITORY_PORT,
} from '../../../outbound';
import { UserPersistenceHost } from '../host/user-persistence.host';

@Injectable()
export class UserRegisterRepository
  extends UserPersistenceHost
  implements IUserRegisterRepositoryPort
{
  public static readonly provider: ClassProvider<IUserRegisterRepositoryPort> = {
    provide: USER_REGISTER_REPOSITORY_PORT,
    useClass: UserRegisterRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async insertUser(query: IUserRegisterStaffUserInsertQuery): Promise<string> {
    return await this.staffUserRepository.insertOne(query);
  }

  public async findRoles(names: RoleEnum[]): Promise<IUserRegisterStaffRoleRecord[]> {
    if (names.length === 0) {
      return [];
    }

    return await this.createStaffRoleBuilder().forRoles(names).getMany();
  }

  public async insertUserRoles(queries: IUserRegisterStaffUserRoleInsertQuery[]): Promise<void> {
    if (queries.length === 0) {
      return;
    }

    await this.staffUserRoleRepository.insert(queries);
  }
}
