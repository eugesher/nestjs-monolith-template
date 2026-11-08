import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IOrderReplaceTagsRecord,
  IOrderReplaceTagsRepositoryPort,
  ORDER_REPLACE_TAGS_REPOSITORY_PORT,
} from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderReplaceTagsRepository
  extends OrderPersistenceHost
  implements IOrderReplaceTagsRepositoryPort
{
  public static readonly provider: ClassProvider<IOrderReplaceTagsRepositoryPort> = {
    provide: ORDER_REPLACE_TAGS_REPOSITORY_PORT,
    useClass: OrderReplaceTagsRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async lockById(orderId: string): Promise<Nullable<IOrderReplaceTagsRecord>> {
    return await this.createOrderBuilder().forLockById(orderId).getOne();
  }
}
