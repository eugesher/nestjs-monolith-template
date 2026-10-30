import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCommonUserModel } from '../../../domain';
import { StaffIdentityCommonUserMapper } from '../mappers/staff-identity-common-user.mapper';
import { type IStaffIdentityCommonLoginRepositoryPort } from '../../../outbound';
import { StaffIdentityCommonUserBaseRepository } from './base/staff-identity-common-user-base.repository';

@Injectable()
export class StaffIdentityCommonLoginRepository
  extends StaffIdentityCommonUserBaseRepository
  implements IStaffIdentityCommonLoginRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async findByEmail(email: string): Promise<Maybe<StaffIdentityCommonUserModel>> {
    const user = await this.users.findOne({
      where: { email },
      relations: { userRoles: { role: true } },
    });

    return user ? StaffIdentityCommonUserMapper.toModel(user) : undefined;
  }
}
