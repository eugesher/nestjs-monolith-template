import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffUser } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCoreUserModel } from '../../../../domain';
import { StaffIdentityCoreUserMapper } from '../../mappers/staff-identity-core-user.mapper';

export abstract class StaffIdentityCoreUserBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get users(): Repository<StaffUser> {
    return this.txHost.tx.getRepository(StaffUser);
  }

  public async findById(id: string): Promise<Maybe<StaffIdentityCoreUserModel>> {
    const user = await this.users.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });

    return user ? StaffIdentityCoreUserMapper.toModel(user) : undefined;
  }
}
