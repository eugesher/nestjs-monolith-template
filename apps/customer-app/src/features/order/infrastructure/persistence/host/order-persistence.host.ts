import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Order, OrderProduct, Product } from '@acme-core/entities';

import { OrderPersistenceProductBuilder } from '../builders/order-persistence-product.builder';
import { OrderPersistenceBuilder } from '../builders/order-persistence.builder';

export abstract class OrderPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  protected get orderProductRepository(): IHostedRepository<OrderProduct> {
    return this.repositoryHost.getRepository(OrderProduct);
  }

  protected get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
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
