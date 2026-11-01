import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MysqlErrorHelper, RepositoryHost } from '@acme-libs/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { Customer } from '@acme-core/entities';

import { AuthCustomerModel, AuthDomainException } from '../../../domain';
import { type IAuthRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthRegisterRepository implements IAuthRegisterRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get customerRepository(): Repository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  public async insert(customer: AuthCustomerModel): Promise<void> {
    const { id, email, passwordHash, status } = customer;

    try {
      await this.customerRepository.insert({ id, email, passwordHash, status });
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
