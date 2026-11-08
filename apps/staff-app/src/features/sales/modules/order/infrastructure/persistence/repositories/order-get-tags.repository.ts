import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IOrderGetTagsRecord,
  IOrderGetTagsRepositoryPort,
  ORDER_GET_TAGS_REPOSITORY_PORT,
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
