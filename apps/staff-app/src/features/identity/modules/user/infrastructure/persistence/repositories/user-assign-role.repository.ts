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
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get roles(): Repository<StaffRole> {
    return this.txHost.tx.getRepository(StaffRole);
  }

  private get userRoles(): Repository<StaffUserRole> {
    return this.txHost.tx.getRepository(StaffUserRole);
  }

  private get users(): Repository<StaffUser> {
    return this.txHost.tx.getRepository(StaffUser);
  }

  public async findById(id: string): Promise<Maybe<UserStaffUserModel>> {
    const user = await this.users.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });

    return user ? UserStaffUserMapper.toModel(user) : undefined;
  }

  public async addRole(userId: string, role: RoleEnum): Promise<boolean> {
    const stored = await this.roles.findOne({ select: { id: true }, where: { name: role } });

    if (!stored) {
      return false;
    }

    await this.userRoles.insert({ userId, roleId: stored.id });

    return true;
  }
}
