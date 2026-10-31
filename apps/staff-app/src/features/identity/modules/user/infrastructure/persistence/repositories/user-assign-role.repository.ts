import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffRole, StaffUser, StaffUserRole } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { UserStaffUserModel } from '../../../domain';
import { type IUserAssignRoleRepositoryPort } from '../../../outbound';
import { UserStaffUserMapper } from '../mappers/user-staff-user.mapper';

@Injectable()
export class UserAssignRoleRepository implements IUserAssignRoleRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get staffRoleRepository(): Repository<StaffRole> {
    return this.transactionHost.tx.getRepository(StaffRole);
  }

  private get staffUserRoleRepository(): Repository<StaffUserRole> {
    return this.transactionHost.tx.getRepository(StaffUserRole);
  }

  private get staffUserRepository(): Repository<StaffUser> {
    return this.transactionHost.tx.getRepository(StaffUser);
  }

  public async findById(id: string): Promise<Maybe<UserStaffUserModel>> {
    const user = await this.staffUserRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });

    return user ? UserStaffUserMapper.toModel(user) : undefined;
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
