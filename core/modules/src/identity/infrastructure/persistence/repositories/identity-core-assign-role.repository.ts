import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Role, UserRole } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { type IIdentityCoreAssignRoleRepositoryPort } from '../../../outbound';
import { IdentityCoreUserBaseRepository } from './base/identity-core-user-base.repository';

@Injectable()
export class IdentityCoreAssignRoleRepository
  extends IdentityCoreUserBaseRepository
  implements IIdentityCoreAssignRoleRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  private get roles(): Repository<Role> {
    return this.txHost.tx.getRepository(Role);
  }

  private get userRoles(): Repository<UserRole> {
    return this.txHost.tx.getRepository(UserRole);
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
