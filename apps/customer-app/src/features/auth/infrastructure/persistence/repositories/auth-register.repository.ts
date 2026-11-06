import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IAuthRegisterCustomerInsertQuery,
  IAuthRegisterRepositoryPort,
  AUTH_REGISTER_REPOSITORY_PORT,
} from '../../../outbound';
import { AuthPersistenceHost } from '../host/auth-persistence.host';

@Injectable()
export class AuthRegisterRepository
  extends AuthPersistenceHost
  implements IAuthRegisterRepositoryPort
{
  public static readonly provider: ClassProvider<IAuthRegisterRepositoryPort> = {
    provide: AUTH_REGISTER_REPOSITORY_PORT,
    useClass: AuthRegisterRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async insert(query: IAuthRegisterCustomerInsertQuery): Promise<string> {
    return await this.customerRepository.insertOne(query);
  }
}
