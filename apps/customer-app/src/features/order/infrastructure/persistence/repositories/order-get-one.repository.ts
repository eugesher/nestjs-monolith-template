import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  ORDER_GET_ONE_REPOSITORY_PORT,
  type IOrderGetOneQuery,
  type IOrderGetOneRecord,
  type IOrderGetOneRepositoryPort,
} from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderGetOneRepository
  extends OrderPersistenceHost
  implements IOrderGetOneRepositoryPort
{
  public static readonly provider: ClassProvider<IOrderGetOneRepositoryPort> = {
    provide: ORDER_GET_ONE_REPOSITORY_PORT,
    useClass: OrderGetOneRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findOwned(query: IOrderGetOneQuery): Promise<Nullable<IOrderGetOneRecord>> {
    return await this.createOrderBuilder().forOwned(query).getOne();
  }
}
