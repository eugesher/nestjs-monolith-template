import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@acme-core/entities';
import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCoreCustomerModel } from '../../../../domain';
import { CustomerIdentityCoreCustomerMapper } from '../../mappers/customer-identity-core-customer.mapper';

export abstract class CustomerIdentityCoreCustomerBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get customers(): Repository<Customer> {
    return this.txHost.tx.getRepository(Customer);
  }

  public async findById(id: string): Promise<Maybe<CustomerIdentityCoreCustomerModel>> {
    const customer = await this.customers.findOne({ where: { id } });

    return customer ? CustomerIdentityCoreCustomerMapper.toModel(customer) : undefined;
  }
}
