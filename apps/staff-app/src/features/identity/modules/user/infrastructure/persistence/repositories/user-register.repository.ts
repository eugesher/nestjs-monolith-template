import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { RoleEnum } from '@acme-libs/kernel';
import { StaffRole, StaffUser, StaffUserRole } from '@acme-staff/common/entities';

import {
  IUserRegisterRepositoryPort,
  IUserStaffRoleFoundRecord,
  IUserStaffUserInsertQuery,
  IUserStaffUserRoleInsertQuery,
} from '../../../outbound';

@Injectable()
export class UserRegisterRepository implements IUserRegisterRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffRoleRepository(): IHostedRepository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  private get staffUserRoleRepository(): IHostedRepository<StaffUserRole> {
    return this.repositoryHost.getRepository(StaffUserRole);
  }

  private get staffUserRepository(): IHostedRepository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async insertUser(query: IUserStaffUserInsertQuery): Promise<string> {
    return await this.staffUserRepository.insertOne(query);
  }

  public async findRoles(names: RoleEnum[]): Promise<IUserStaffRoleFoundRecord[]> {
    if (names.length === 0) {
      return [];
    }

    return await this.staffRoleRepository
      .createQueryBuilder('StaffRole')
      .select(['StaffRole.id'])
      .where('StaffRole.name IN (:...names)', { names })
      .getMany();
  }

  public async insertUserRoles(queries: IUserStaffUserRoleInsertQuery[]): Promise<void> {
    if (queries.length === 0) {
      return;
    }

    await this.staffUserRoleRepository.insert(queries);
  }
}
