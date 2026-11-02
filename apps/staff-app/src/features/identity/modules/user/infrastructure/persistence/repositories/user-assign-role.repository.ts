import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffRole, StaffUser, StaffUserRole } from '@acme-staff/common/entities';

import { UserStaffUserModel } from '../../../domain';
import { type IUserAssignRoleRepositoryPort } from '../../../outbound';
import { UserStaffUserMapper } from '../mappers/user-staff-user.mapper';

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
    const user = await this.staffUserRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });

    return user ? UserStaffUserMapper.toModel(user) : null;
  }

  public async addRole(userId: string, role: RoleEnum): Promise<boolean> {
    const stored = await this.staffRoleRepository.findOne({
      select: { id: true },
      where: { name: role },
    });

    if (!stored) {
      return false;
    }

    await this.staffUserRoleRepository.insert({ userId, roleId: stored.id });

    return true;
  }
}
