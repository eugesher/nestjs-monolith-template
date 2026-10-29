import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffRole, StaffUserRole } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { type IStaffIdentityCoreAssignRoleRepositoryPort } from '../../../outbound';
import { StaffIdentityCoreUserBaseRepository } from './base/staff-identity-core-user-base.repository';

@Injectable()
export class StaffIdentityCoreAssignRoleRepository
  extends StaffIdentityCoreUserBaseRepository
  implements IStaffIdentityCoreAssignRoleRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  private get roles(): Repository<StaffRole> {
    return this.txHost.tx.getRepository(StaffRole);
  }

  private get userRoles(): Repository<StaffUserRole> {
    return this.txHost.tx.getRepository(StaffUserRole);
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
