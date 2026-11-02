import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { Customer } from '@acme-core/entities';

import { AuthCustomerModel, AuthEmailTakenException, IAuthCustomerDraft } from '../../../domain';
import { IAuthRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthRegisterRepository implements IAuthRegisterRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get customerRepository(): Repository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  public async insert(draft: IAuthCustomerDraft): Promise<AuthCustomerModel> {
    const { email, passwordHash, status } = draft;
    const id = await this.insertRow(draft);

    return AuthCustomerModel.reconstitute({ id, email, passwordHash, status });
  }

  private async insertRow(draft: IAuthCustomerDraft): Promise<string> {
    const { email, passwordHash, status } = draft;

    try {
      const result = await this.customerRepository.insert({ email, passwordHash, status });
      const [identifier] = result.identifiers as { id: number | string }[];

      return String(identifier.id);
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new AuthEmailTakenException(email);
      }

      throw error;
    }
  }
}
