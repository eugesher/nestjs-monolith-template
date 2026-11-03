import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Customer } from '@acme-core/entities';

import { IAuthCustomerFoundRecord, IAuthLoginRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthLoginRepository implements IAuthLoginRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get customerRepository(): IHostedRepository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  public async findByEmail(email: string): Promise<Nullable<IAuthCustomerFoundRecord>> {
    return await this.customerRepository
      .createQueryBuilder('Customer')
      .select(['Customer.id', 'Customer.email', 'Customer.passwordHash', 'Customer.status'])
      .where('Customer.email = :email', { email })
      .getOne();
  }
}
