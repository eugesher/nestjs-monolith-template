import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IOrderPlaceInsertQuery,
  IOrderPlaceRecord,
  IOrderPlaceProductRecord,
  IOrderPlaceRepositoryPort,
  IOrderPlaceOrderProductInsertQuery,
} from '../../../outbound';
import { OrderRepositoryHost } from '../host/order.repository.host';

@Injectable()
export class OrderPlaceRepository extends OrderRepositoryHost implements IOrderPlaceRepositoryPort {
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

  public async findOrder(orderId: string): Promise<IOrderPlaceRecord> {
    return await this.createOrderBuilder().forPlaced(orderId).getOneOrFail();
  }
}
