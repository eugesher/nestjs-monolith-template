import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { Role, User, UserRole } from '@acme-core/entities';
import { IdentityCoreUserModel } from '../../../domain';
import { type IIdentityCoreRegisterUserRepositoryPort } from '../../../outbound';

@Injectable()
export class IdentityCoreRegisterUserRepository implements IIdentityCoreRegisterUserRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get roles(): Repository<Role> {
    return this.txHost.tx.getRepository(Role);
  }

  private get userRoles(): Repository<UserRole> {
    return this.txHost.tx.getRepository(UserRole);
  }

  private get users(): Repository<User> {
    return this.txHost.tx.getRepository(User);
  }

  public existsByEmail(email: string): Promise<boolean> {
    return this.users.exists({ where: { email } });
  }

  public async insert(user: IdentityCoreUserModel): Promise<void> {
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
