import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import { IOrderGetOneRecord, IOrderGetOneRepositoryPort } from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderGetOneRepository
  extends OrderPersistenceHost
  implements IOrderGetOneRepositoryPort
{
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
