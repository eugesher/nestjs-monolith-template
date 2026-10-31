import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import { AuthCustomerModel } from '../../../domain';
import { type IAuthLoginRepositoryPort } from '../../../outbound';
import { AuthCustomerMapper } from '../mappers/auth-customer.mapper';

@Injectable()
export class AuthLoginRepository implements IAuthLoginRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get customerRepository(): Repository<Customer> {
    return this.transactionHost.tx.getRepository(Customer);
  }

  public async findByEmail(email: string): Promise<Maybe<AuthCustomerModel>> {
    const customer = await this.customerRepository.findOne({ where: { email } });

    return customer ? AuthCustomerMapper.toModel(customer) : undefined;
  }
}
