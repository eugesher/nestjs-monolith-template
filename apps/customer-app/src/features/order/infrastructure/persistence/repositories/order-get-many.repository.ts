import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IOrderGetManyQuery,
  IOrderGetManyRecord,
  IOrderGetManyRepositoryPort,
  ORDER_GET_MANY_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: IOrderGetManyQuery): Promise<IOrderGetManyRecord> {
    return await this.createOrderBuilder().forList(query).getManyAndCount();
  }
}
