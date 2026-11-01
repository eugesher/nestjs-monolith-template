import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MysqlErrorHelper, RepositoryHost } from '@acme-libs/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { Customer } from '@acme-core/entities';

import { AuthCustomerModel, AuthDomainException, IAuthCustomerDraft } from '../../../domain';
import { type IAuthRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthRegisterRepository implements IAuthRegisterRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

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
