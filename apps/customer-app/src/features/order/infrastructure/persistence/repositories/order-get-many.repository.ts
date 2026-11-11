import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  ORDER_GET_MANY_REPOSITORY_PORT,
  type IOrderGetManyQuery,
  type IOrderGetManyRecord,
  type IOrderGetManyRepositoryPort,
} from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderGetManyRepository
  extends OrderPersistenceHost
  implements IOrderGetManyRepositoryPort
{
  public static readonly provider: ClassProvider<IOrderGetManyRepositoryPort> = {
    provide: ORDER_GET_MANY_REPOSITORY_PORT,
    useClass: OrderGetManyRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async list(query: IOrderGetManyQuery): Promise<IOrderGetManyRecord> {
    return await this.createOrderBuilder().forList(query).getManyAndCount();
  }
}
