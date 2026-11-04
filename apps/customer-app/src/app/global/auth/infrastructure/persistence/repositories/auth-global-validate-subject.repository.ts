import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { UserStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { Customer } from '@acme-core/entities';

import {
  IAuthGlobalCustomerRecord,
  IAuthGlobalValidateSubjectRepositoryPort,
} from '../../../outbound';

@Injectable()
export class AuthGlobalValidateSubjectRepository implements IAuthGlobalValidateSubjectRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get customerRepository(): IHostedRepository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  public async findActiveById(id: string): Promise<Nullable<IAuthGlobalCustomerRecord>> {
    return await this.customerRepository
      .createQueryBuilder('Customer')
      .select(['Customer.id', 'Customer.email'])
      .where('Customer.id = :id', { id })
      .andWhere('Customer.status = :status', { status: UserStatusEnum.ACTIVE })
      .getOne();
  }
}
