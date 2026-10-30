import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@acme-core/entities';
import { MysqlErrorHelper } from '@acme-libs/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { AuthCustomerModel, AuthDomainException } from '../../../domain';
import { type IAuthRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthRegisterRepository implements IAuthRegisterRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get customers(): Repository<Customer> {
    return this.txHost.tx.getRepository(Customer);
  }

  public async insert(customer: AuthCustomerModel): Promise<void> {
    const { id, email, passwordHash, status } = customer;

    try {
      await this.customers.insert({ id, email, passwordHash, status });
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        `Email ${email} is already registered`,
      );
    }
  }
}
