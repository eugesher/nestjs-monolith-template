import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { MysqlErrorHelper } from '@acme-libs/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { CustomerIdentityCoreCustomerModel, CustomerIdentityCoreException } from '../../../domain';
import { type ICustomerIdentityCoreRegisterRepositoryPort } from '../../../outbound';
import { CustomerIdentityCoreCustomerBaseRepository } from './base/customer-identity-core-customer-base.repository';

@Injectable()
export class CustomerIdentityCoreRegisterRepository
  extends CustomerIdentityCoreCustomerBaseRepository
  implements ICustomerIdentityCoreRegisterRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async insert(customer: CustomerIdentityCoreCustomerModel): Promise<void> {
    const { id, email, passwordHash, status } = customer;

    try {
      await this.customers.insert({ id, email, passwordHash, status });
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new CustomerIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        `Email ${email} is already registered`,
      );
    }
  }
}
