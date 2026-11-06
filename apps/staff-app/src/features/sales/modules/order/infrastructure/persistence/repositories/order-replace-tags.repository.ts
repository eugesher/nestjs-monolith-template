import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import { IOrderReplaceTagsRecord, IOrderReplaceTagsRepositoryPort } from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderReplaceTagsRepository
  extends OrderPersistenceHost
  implements IOrderReplaceTagsRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async lockById(orderId: string): Promise<Nullable<IOrderReplaceTagsRecord>> {
    return await this.createOrderBuilder().forLockById(orderId).getOne();
  }
}
