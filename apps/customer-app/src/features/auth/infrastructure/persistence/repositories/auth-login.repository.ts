import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  AUTH_LOGIN_REPOSITORY_PORT,
  IAuthLoginCustomerRecord,
  IAuthLoginRepositoryPort,
} from '../../../outbound';
import { AuthPersistenceHost } from '../host/auth-persistence.host';

@Injectable()
export class AuthLoginRepository extends AuthPersistenceHost implements IAuthLoginRepositoryPort {
  public static readonly provider: ClassProvider<IAuthLoginRepositoryPort> = {
    provide: AUTH_LOGIN_REPOSITORY_PORT,
    useClass: AuthLoginRepository,
  };

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
