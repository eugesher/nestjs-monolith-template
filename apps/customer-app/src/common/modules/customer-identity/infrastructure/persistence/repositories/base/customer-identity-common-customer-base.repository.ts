import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCommonCustomerModel } from '../../../../domain';
import { CustomerIdentityCommonCustomerMapper } from '../../mappers/customer-identity-common-customer.mapper';

export abstract class CustomerIdentityCommonCustomerBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get customers(): Repository<Customer> {
    return this.txHost.tx.getRepository(Customer);
  }

  public async findById(id: string): Promise<Maybe<CustomerIdentityCommonCustomerModel>> {
    const customer = await this.customers.findOne({ where: { id } });

    return customer ? CustomerIdentityCommonCustomerMapper.toModel(customer) : undefined;
  }
}
