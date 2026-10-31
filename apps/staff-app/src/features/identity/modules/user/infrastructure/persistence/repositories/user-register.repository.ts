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

  public async insert(user: UserStaffUserModel): Promise<void> {
    const { id, email, passwordHash, status } = user;

    try {
      await this.staffUserRepository.insert({ id, email, passwordHash, status });
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

    const roles = await this.staffRoleRepository.find({
      select: { id: true },
      where: { name: In([...user.roles]) },
    });
    const rows = roles.map((role) => ({ userId: user.id, roleId: role.id }));

    await this.staffUserRoleRepository.insert(rows);
  }
}
