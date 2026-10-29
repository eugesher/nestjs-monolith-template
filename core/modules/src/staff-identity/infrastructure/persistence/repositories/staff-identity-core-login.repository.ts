import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCoreUserModel } from '../../../domain';
import { StaffIdentityCoreUserMapper } from '../mappers/staff-identity-core-user.mapper';
import { type IStaffIdentityCoreLoginRepositoryPort } from '../../../outbound';
import { StaffIdentityCoreUserBaseRepository } from './base/staff-identity-core-user-base.repository';

@Injectable()
export class StaffIdentityCoreLoginRepository
  extends StaffIdentityCoreUserBaseRepository
  implements IStaffIdentityCoreLoginRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async findByEmail(email: string): Promise<Maybe<StaffIdentityCoreUserModel>> {
    const user = await this.users.findOne({
      where: { email },
      relations: { userRoles: { role: true } },
    });

    return user ? StaffIdentityCoreUserMapper.toModel(user) : undefined;
  }
}
