import { Order, OrderProduct, Product } from '@acme-core/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { OrderPersistenceProductBuilder } from '../builders/order-persistence-product.builder';
import { OrderPersistenceBuilder } from '../builders/order-persistence.builder';

export abstract class OrderPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get orderRepository(): IHostedRepository<Order> {
    return this.orm.getRepository(Order);
  }

  protected get orderProductRepository(): IHostedRepository<OrderProduct> {
    return this.orm.getRepository(OrderProduct);
  }

  protected get productRepository(): IHostedRepository<Product> {
    return this.orm.getRepository(Product);
  }

  protected createOrderBuilder(): OrderPersistenceBuilder {
    return new OrderPersistenceBuilder(this.orderRepository.createQueryBuilder(Order.name));
  }

  protected createProductBuilder(): OrderPersistenceProductBuilder {
    return new OrderPersistenceProductBuilder(
      this.productRepository.createQueryBuilder(Product.name),
    );
  }
}
