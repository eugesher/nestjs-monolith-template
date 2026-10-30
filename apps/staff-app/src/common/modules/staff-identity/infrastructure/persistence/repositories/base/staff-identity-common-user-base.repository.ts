import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffUser } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCommonUserModel } from '../../../../domain';
import { StaffIdentityCommonUserMapper } from '../../mappers/staff-identity-common-user.mapper';

export abstract class StaffIdentityCommonUserBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get users(): Repository<StaffUser> {
    return this.txHost.tx.getRepository(StaffUser);
  }

  public async findById(id: string): Promise<Maybe<StaffIdentityCommonUserModel>> {
    const user = await this.users.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });

    return user ? StaffIdentityCommonUserMapper.toModel(user) : undefined;
  }
}
