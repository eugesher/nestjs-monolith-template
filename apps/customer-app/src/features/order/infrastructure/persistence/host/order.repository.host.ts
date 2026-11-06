import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Order, OrderProduct, Product } from '@acme-core/entities';

import { OrderQueryProductBuilder } from '../builders/order-query-product.builder';
import { OrderQueryBuilder } from '../builders/order-query.builder';

export abstract class OrderRepositoryHost {
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

  protected createOrderBuilder(alias = Order.name): OrderQueryBuilder {
    return new OrderQueryBuilder(this.orderRepository.createQueryBuilder(alias));
  }

  protected createProductBuilder(alias = Product.name): OrderQueryProductBuilder {
    return new OrderQueryProductBuilder(this.productRepository.createQueryBuilder(alias));
  }
}
