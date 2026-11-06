import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IOrderGetManyRepositoryPort,
  IOrderGetManyRecord,
  IOrderGetManyListQuery,
} from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderGetManyRepository
  extends OrderPersistenceHost
  implements IOrderGetManyRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: IOrderGetManyListQuery): Promise<IOrderGetManyRecord> {
    return await this.createOrderBuilder().forList(query).getManyAndCount();
  }
}
