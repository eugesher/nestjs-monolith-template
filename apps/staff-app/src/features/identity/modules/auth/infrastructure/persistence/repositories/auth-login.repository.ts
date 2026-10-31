import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffUser } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import { AuthStaffUserModel } from '../../../domain';
import { type IAuthLoginRepositoryPort } from '../../../outbound';
import { AuthStaffUserMapper } from '../mappers/auth-staff-user.mapper';

@Injectable()
export class AuthLoginRepository implements IAuthLoginRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get staffUserRepository(): Repository<StaffUser> {
    return this.transactionHost.tx.getRepository(StaffUser);
  }

  public async findByEmail(email: string): Promise<Maybe<AuthStaffUserModel>> {
    const user = await this.staffUserRepository.findOne({ where: { email } });

    return user ? AuthStaffUserMapper.toModel(user) : undefined;
  }
}
