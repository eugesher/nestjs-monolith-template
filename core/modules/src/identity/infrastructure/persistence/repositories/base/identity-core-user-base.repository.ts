import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { User } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../../../domain';
import { IdentityCoreUserMapper } from '../../mappers/identity-core-user.mapper';

export abstract class IdentityCoreUserBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get users(): Repository<User> {
    return this.txHost.tx.getRepository(User);
  }

  public async findById(id: string): Promise<Maybe<IdentityCoreUserModel>> {
    const user = await this.users.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });

    return user ? IdentityCoreUserMapper.toModel(user) : undefined;
  }
}
