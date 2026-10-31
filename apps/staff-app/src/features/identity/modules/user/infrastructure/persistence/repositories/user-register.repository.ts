import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { StaffRole, StaffUser, StaffUserRole } from '@acme-core/entities';
import { MysqlErrorHelper } from '@acme-libs/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { UserDomainException, UserStaffUserModel } from '../../../domain';
import { type IUserRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class UserRegisterRepository implements IUserRegisterRepositoryPort {
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

  public async insert(user: UserStaffUserModel): Promise<void> {
    const { id, email, passwordHash, status } = user;

    try {
      await this.users.insert({ id, email, passwordHash, status });
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new UserDomainException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        `Email ${email} is already registered`,
      );
    }

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
