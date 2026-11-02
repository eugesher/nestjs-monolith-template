import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffRole, StaffUser, StaffUserRole } from '@acme-staff/common/entities';

import { UserStaffUserModel } from '../../../domain';
import { IUserAssignRoleRepositoryPort } from '../../../outbound';

@Injectable()
export class UserAssignRoleRepository implements IUserAssignRoleRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffRoleRepository(): Repository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  private get staffUserRoleRepository(): Repository<StaffUserRole> {
    return this.repositoryHost.getRepository(StaffUserRole);
  }

  private get staffUserRepository(): Repository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async findById(id: string): Promise<Nullable<UserStaffUserModel>> {
    const user = await this.staffUserRepository
      .createQueryBuilder('StaffUser')
      .select(['StaffUser.id', 'StaffUser.email', 'StaffUser.passwordHash', 'StaffUser.status'])
      .leftJoin('StaffUser.userRoles', 'StaffUserRole')
      .addSelect(['StaffUserRole.userId', 'StaffUserRole.roleId'])
      .leftJoin('StaffUserRole.role', 'StaffRole')
      .addSelect(['StaffRole.id', 'StaffRole.name'])
      .where('StaffUser.id = :id', { id })
      .getOne();

    if (!user) {
      return null;
    }

    const roles = user.userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return UserStaffUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      roles,
    });
  }

  public async addRole(userId: string, role: RoleEnum): Promise<boolean> {
    const stored = await this.staffRoleRepository
      .createQueryBuilder('StaffRole')
      .select(['StaffRole.id'])
      .where('StaffRole.name = :role', { role })
      .getOne();

    if (!stored) {
      return false;
    }

    await this.staffUserRoleRepository.insert({ userId, roleId: stored.id });

    return true;
  }
}
