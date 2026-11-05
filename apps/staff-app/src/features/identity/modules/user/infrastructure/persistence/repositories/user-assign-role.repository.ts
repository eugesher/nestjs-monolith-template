import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffRole, StaffUser, StaffUserRole } from '@acme-core/entities';

import {
  IUserAssignRoleRepositoryPort,
  IUserAssignRoleStaffRoleRecord,
  IUserAssignRoleStaffUserRecord,
  IUserAssignRoleStaffUserRoleInsertQuery,
} from '../../../outbound';

@Injectable()
export class UserAssignRoleRepository implements IUserAssignRoleRepositoryPort {
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

  public async findById(id: string): Promise<Nullable<IUserAssignRoleStaffUserRecord>> {
    return await this.staffUserRepository
      .createQueryBuilder('StaffUser')
      .select(['StaffUser.id', 'StaffUser.email', 'StaffUser.passwordHash', 'StaffUser.status'])
      .leftJoin('StaffUser.userRoles', 'StaffUserRole')
      .addSelect(['StaffUserRole.userId', 'StaffUserRole.roleId'])
      .leftJoin('StaffUserRole.role', 'StaffRole')
      .addSelect(['StaffRole.id', 'StaffRole.name'])
      .where('StaffUser.id = :id', { id })
      .getOne();
  }

  public async findRole(name: RoleEnum): Promise<Nullable<IUserAssignRoleStaffRoleRecord>> {
    return await this.staffRoleRepository
      .createQueryBuilder('StaffRole')
      .select(['StaffRole.id'])
      .where('StaffRole.name = :name', { name })
      .getOne();
  }

  public async insertUserRole(query: IUserAssignRoleStaffUserRoleInsertQuery): Promise<void> {
    await this.staffUserRoleRepository.insert(query);
  }
}
