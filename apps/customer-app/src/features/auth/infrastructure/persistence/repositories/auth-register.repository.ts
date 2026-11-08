import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  AUTH_REGISTER_REPOSITORY_PORT,
  IAuthRegisterCustomerInsertQuery,
  IAuthRegisterRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async insert(query: IAuthRegisterCustomerInsertQuery): Promise<string> {
    return await this.customerRepository.insertOne(query);
  }
}
