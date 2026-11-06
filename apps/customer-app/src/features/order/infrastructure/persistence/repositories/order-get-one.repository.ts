import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IOrderGetOneQuery,
  IOrderGetOneRecord,
  IOrderGetOneRepositoryPort,
} from '../../../outbound';
import { OrderRepositoryHost } from '../host/order.repository.host';

@Injectable()
export class OrderGetOneRepository
  extends OrderRepositoryHost
  implements IOrderGetOneRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findOwned(query: IOrderGetOneQuery): Promise<Nullable<IOrderGetOneRecord>> {
    return await this.createOrderBuilder().forOwned(query).getOne();
  }
}
