import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  ORDER_PLACE_REPOSITORY_PORT,
  type IOrderPlaceInsertQuery,
  type IOrderPlaceOrderProductInsertQuery,
  type IOrderPlaceProductRecord,
  type IOrderPlaceRecord,
  type IOrderPlaceRepositoryPort,
} from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderPlaceRepository
  extends OrderPersistenceHost
  implements IOrderPlaceRepositoryPort
{
  public static readonly provider: ClassProvider<IOrderPlaceRepositoryPort> = {
    provide: ORDER_PLACE_REPOSITORY_PORT,
    useClass: OrderPlaceRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductRecord[]> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.createProductBuilder().forActive(productIds).getMany();
  }

  public async insertOrder(query: IOrderPlaceInsertQuery): Promise<string> {
    return await this.orderRepository.insertOne(query);
  }

  public async insertOrderProducts(queries: IOrderPlaceOrderProductInsertQuery[]): Promise<void> {
    await this.orderProductRepository.insert(queries);
  }

  public async findPlaced(orderId: string): Promise<IOrderPlaceRecord> {
    return await this.createOrderBuilder().forPlaced(orderId).getOneOrFail();
  }
}
