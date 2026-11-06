import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IOrderPlaceInsertQuery,
  IOrderPlaceRecord,
  IOrderPlaceProductRecord,
  IOrderPlaceRepositoryPort,
  IOrderPlaceOrderProductInsertQuery,
  ORDER_PLACE_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
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
