import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { Order, OrderProduct, Product } from '@acme-core/entities';

import {
  IOrderInsertQuery,
  IOrderPlacedRecord,
  IOrderPlaceProductRecord,
  IOrderPlaceRepositoryPort,
  IOrderProductInsertQuery,
} from '../../../outbound';

@Injectable()
export class OrderPlaceRepository implements IOrderPlaceRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  private get orderProductRepository(): IHostedRepository<OrderProduct> {
    return this.repositoryHost.getRepository(OrderProduct);
  }

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductRecord[]> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id'])
      .where('Product.id IN (:...productIds)', { productIds })
      .andWhere('Product.status = :status', { status: ProductStatusEnum.ACTIVE })
      .getMany();
  }

  public async insertOrder(query: IOrderInsertQuery): Promise<string> {
    return await this.orderRepository.insertOne(query);
  }

  public async insertOrderProducts(queries: IOrderProductInsertQuery[]): Promise<void> {
    await this.orderProductRepository.insert(queries);
  }

  public async findOrder(orderId: string): Promise<IOrderPlacedRecord> {
    return await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .leftJoin('Order.orderProducts', 'OrderProduct')
      .addSelect(['OrderProduct.id', 'OrderProduct.productId'])
      .leftJoin('OrderProduct.product', 'Product')
      .addSelect(['Product.id', 'Product.sku', 'Product.name'])
      .where('Order.id = :orderId', { orderId })
      .orderBy('OrderProduct.id', 'ASC')
      .getOneOrFail();
  }
}
