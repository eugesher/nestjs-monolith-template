import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@acme-core/entities';
import { UserStatusEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  IAuthGlobalCustomerView,
  type IAuthGlobalValidateSubjectRepositoryPort,
} from '../../../outbound';

@Injectable()
export class AuthGlobalValidateSubjectRepository implements IAuthGlobalValidateSubjectRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get customerRepository(): Repository<Customer> {
    return this.transactionHost.tx.getRepository(Customer);
  }

  public async findActiveById(id: string): Promise<Maybe<IAuthGlobalCustomerView>> {
    const customer = await this.customerRepository.findOne({
      select: { id: true, email: true },
      where: { id, status: UserStatusEnum.ACTIVE },
    });

    return customer ?? undefined;
  }
}
