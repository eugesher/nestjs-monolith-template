import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Customer } from '@acme-core/entities';

import { IAuthCustomerInsertCommand, IAuthRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthRegisterRepository implements IAuthRegisterRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get customerRepository(): IHostedRepository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  public async insert(command: IAuthCustomerInsertCommand): Promise<string> {
    return await this.customerRepository.insertOne(command);
  }
}
