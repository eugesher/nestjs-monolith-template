import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { MysqlErrorHelper } from '@acme-libs/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import {
  CustomerIdentityCommonCustomerModel,
  CustomerIdentityCommonException,
} from '../../../domain';
import { type ICustomerIdentityCommonRegisterRepositoryPort } from '../../../outbound';
import { CustomerIdentityCommonCustomerBaseRepository } from './base/customer-identity-common-customer-base.repository';

@Injectable()
export class CustomerIdentityCommonRegisterRepository
  extends CustomerIdentityCommonCustomerBaseRepository
  implements ICustomerIdentityCommonRegisterRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async insert(customer: CustomerIdentityCommonCustomerModel): Promise<void> {
    const { id, email, passwordHash, status } = customer;

    try {
      await this.customers.insert({ id, email, passwordHash, status });
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new CustomerIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        `Email ${email} is already registered`,
      );
    }
  }
}
