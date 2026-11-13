import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  AUTH_REGISTER_REPOSITORY_PORT,
  AuthRegisterCustomerInsertOutcomeEnum,
  type IAuthRegisterCustomerInsertQuery,
  type IAuthRegisterCustomerInsertRecord,
  type IAuthRegisterRepositoryPort,
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

  public async insert(
    query: IAuthRegisterCustomerInsertQuery,
  ): Promise<IAuthRegisterCustomerInsertRecord> {
    try {
      const customerId = await this.customerRepository.insertOne(query);

      return { outcome: AuthRegisterCustomerInsertOutcomeEnum.INSERTED, id: customerId };
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return { outcome: AuthRegisterCustomerInsertOutcomeEnum.DUPLICATE };
      }

      throw error;
    }
  }
}
