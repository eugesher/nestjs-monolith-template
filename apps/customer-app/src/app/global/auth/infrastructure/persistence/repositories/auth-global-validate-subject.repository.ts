import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import {
  IAuthGlobalCustomerView,
  type IAuthGlobalValidateSubjectRepositoryPort,
} from '../../../outbound';

@Injectable()
export class AuthGlobalValidateSubjectRepository implements IAuthGlobalValidateSubjectRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get customers(): Repository<Customer> {
    return this.txHost.tx.getRepository(Customer);
  }

  public async findById(id: string): Promise<Maybe<IAuthGlobalCustomerView>> {
    const customer = await this.customers.findOne({
      select: { id: true, email: true, status: true },
      where: { id },
    });

    return customer ?? undefined;
  }
}
