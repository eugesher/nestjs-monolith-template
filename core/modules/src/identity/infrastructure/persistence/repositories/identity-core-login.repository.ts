import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../../domain';
import { IdentityCoreUserMapper } from '../mappers/identity-core-user.mapper';
import { type IIdentityCoreLoginRepositoryPort } from '../../../outbound';
import { IdentityCoreUserBaseRepository } from './base/identity-core-user-base.repository';

@Injectable()
export class IdentityCoreLoginRepository
  extends IdentityCoreUserBaseRepository
  implements IIdentityCoreLoginRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async findByEmail(email: string): Promise<Maybe<IdentityCoreUserModel>> {
    const user = await this.users.findOne({
      where: { email },
      relations: { userRoles: { role: true } },
    });

    return user ? IdentityCoreUserMapper.toModel(user) : undefined;
  }
}
