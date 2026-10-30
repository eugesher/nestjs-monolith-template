import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCommonCustomerModel } from '../../../domain';
import { CustomerIdentityCommonCustomerMapper } from '../mappers/customer-identity-common-customer.mapper';
import { type ICustomerIdentityCommonLoginRepositoryPort } from '../../../outbound';
import { CustomerIdentityCommonCustomerBaseRepository } from './base/customer-identity-common-customer-base.repository';

@Injectable()
export class CustomerIdentityCommonLoginRepository
  extends CustomerIdentityCommonCustomerBaseRepository
  implements ICustomerIdentityCommonLoginRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async findByEmail(email: string): Promise<Maybe<CustomerIdentityCommonCustomerModel>> {
    const customer = await this.customers.findOne({ where: { email } });

    return customer ? CustomerIdentityCommonCustomerMapper.toModel(customer) : undefined;
  }
}
