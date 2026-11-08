import { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';
import { Order } from '@acme-core/entities';

import { OrderPersistenceBuilder } from '../builders/order-persistence.builder';

export abstract class OrderPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get orderRepository(): IHostedRepository<Order> {
    return this.orm.getRepository(Order);
  }

  protected createOrderBuilder(): OrderPersistenceBuilder {
    return new OrderPersistenceBuilder(this.orderRepository.createQueryBuilder(Order.name));
  }
}
