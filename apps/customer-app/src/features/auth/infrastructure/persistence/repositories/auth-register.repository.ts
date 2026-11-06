import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IAuthRegisterCustomerInsertQuery, IAuthRegisterRepositoryPort } from '../../../outbound';
import { AuthPersistenceHost } from '../host/auth-persistence.host';

@Injectable()
export class AuthRegisterRepository
  extends AuthPersistenceHost
  implements IAuthRegisterRepositoryPort
{
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
