import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { UserStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { Customer } from '@acme-core/entities';

import {
  IAuthGlobalCustomerView,
  type IAuthGlobalValidateSubjectRepositoryPort,
} from '../../../outbound';

@Injectable()
export class AuthGlobalValidateSubjectRepository implements IAuthGlobalValidateSubjectRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get customerRepository(): Repository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  public async findActiveById(id: string): Promise<Nullable<IAuthGlobalCustomerView>> {
    const customer = await this.customerRepository.findOne({
      select: { id: true, email: true },
      where: { id, status: UserStatusEnum.ACTIVE },
    });

    return customer;
  }
}
