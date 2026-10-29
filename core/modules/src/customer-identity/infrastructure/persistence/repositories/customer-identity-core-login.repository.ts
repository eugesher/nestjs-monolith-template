import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCoreCustomerModel } from '../../../domain';
import { CustomerIdentityCoreCustomerMapper } from '../mappers/customer-identity-core-customer.mapper';
import { type ICustomerIdentityCoreLoginRepositoryPort } from '../../../outbound';
import { CustomerIdentityCoreCustomerBaseRepository } from './base/customer-identity-core-customer-base.repository';

@Injectable()
export class CustomerIdentityCoreLoginRepository
  extends CustomerIdentityCoreCustomerBaseRepository
  implements ICustomerIdentityCoreLoginRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async findByEmail(email: string): Promise<Maybe<CustomerIdentityCoreCustomerModel>> {
    const customer = await this.customers.findOne({ where: { email } });

    return customer ? CustomerIdentityCoreCustomerMapper.toModel(customer) : undefined;
  }
}
