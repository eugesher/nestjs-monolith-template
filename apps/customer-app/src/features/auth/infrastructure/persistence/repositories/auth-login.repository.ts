import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import { IAuthLoginCustomerRecord, IAuthLoginRepositoryPort } from '../../../outbound';
import { AuthPersistenceHost } from '../host/auth-persistence.host';

@Injectable()
export class AuthLoginRepository extends AuthPersistenceHost implements IAuthLoginRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findByEmail(email: string): Promise<Nullable<IAuthLoginCustomerRecord>> {
    return await this.createCustomerBuilder().forByEmail(email).getOne();
  }
}
