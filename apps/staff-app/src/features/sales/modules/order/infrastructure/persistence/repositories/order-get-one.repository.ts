import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IOrderGetOneRecord,
  IOrderGetOneRepositoryPort,
  ORDER_GET_ONE_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findById(orderId: string): Promise<Nullable<IOrderGetOneRecord>> {
    return await this.createOrderBuilder().forById(orderId).getOne();
  }
}
