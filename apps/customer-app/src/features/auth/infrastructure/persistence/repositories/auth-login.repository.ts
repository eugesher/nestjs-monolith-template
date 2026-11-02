import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Customer } from '@acme-core/entities';

import { AuthCustomerModel } from '../../../domain';
import { type IAuthLoginRepositoryPort } from '../../../outbound';
import { AuthCustomerMapper } from '../mappers/auth-customer.mapper';

@Injectable()
export class AuthLoginRepository implements IAuthLoginRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get customerRepository(): Repository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  public async findByEmail(email: string): Promise<Nullable<AuthCustomerModel>> {
    const customer = await this.customerRepository
      .createQueryBuilder('Customer')
      .select(['Customer.id', 'Customer.email', 'Customer.passwordHash', 'Customer.status'])
      .where('Customer.email = :email', { email })
      .getOne();

    return customer ? AuthCustomerMapper.toModel(customer) : null;
  }
}
