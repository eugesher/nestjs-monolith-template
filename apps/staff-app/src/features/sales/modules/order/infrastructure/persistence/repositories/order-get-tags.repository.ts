import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  ORDER_GET_TAGS_REPOSITORY_PORT,
  type IOrderGetTagsRecord,
  type IOrderGetTagsRepositoryPort,
} from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderGetTagsRepository
  extends OrderPersistenceHost
  implements IOrderGetTagsRepositoryPort
{
  public static readonly provider: ClassProvider<IOrderGetTagsRepositoryPort> = {
    provide: ORDER_GET_TAGS_REPOSITORY_PORT,
    useClass: OrderGetTagsRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findExisting(orderId: string): Promise<Nullable<IOrderGetTagsRecord>> {
    return await this.createOrderBuilder().forExisting(orderId).getOne();
  }
}
