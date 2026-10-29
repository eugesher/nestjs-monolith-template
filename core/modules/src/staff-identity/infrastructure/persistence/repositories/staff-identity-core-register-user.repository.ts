import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { StaffRole, StaffUser, StaffUserRole } from '@acme-core/entities';
import { StaffIdentityCoreUserModel } from '../../../domain';
import { type IStaffIdentityCoreRegisterUserRepositoryPort } from '../../../outbound';

@Injectable()
export class StaffIdentityCoreRegisterUserRepository implements IStaffIdentityCoreRegisterUserRepositoryPort {
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

  public existsByEmail(email: string): Promise<boolean> {
    return this.users.exists({ where: { email } });
  }

  public async insert(user: StaffIdentityCoreUserModel): Promise<void> {
    await this.users.insert({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
    });

    if (user.roles.length === 0) {
      return;
    }

    const roles = await this.roles.find({
      select: { id: true },
      where: { name: In([...user.roles]) },
    });
    const rows = roles.map((role) => ({ userId: user.id, roleId: role.id }));

    await this.userRoles.insert(rows);
  }
}
