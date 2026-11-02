import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IPage, Nullable } from '@acme-libs/toolkit';
import { Order, OrderProduct, Product } from '@acme-core/entities';

import { IOrderProductRecord, OrderModel } from '../../../domain';
import {
  type IOrderCrudRepositoryPort,
  IOrderFindOwnedQuery,
  IOrderListedView,
  IOrderPageQuery,
} from '../../../outbound';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderCrudRepository implements IOrderCrudRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): Repository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  private get orderProductRepository(): Repository<OrderProduct> {
    return this.repositoryHost.getRepository(OrderProduct);
  }

  public async list(query: IOrderPageQuery): Promise<IPage<IOrderListedView>> {
    const { page, size, customerId } = query;
    const [orders, total] = await this.orderRepository.findAndCount({
      select: { id: true, createdAt: true },
      where: { customerId },
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    const items = orders.map((order) => ({ id: order.id, createdAt: order.createdAt }));

    return { items, total, page, size };
  }

  public async findOwned(query: IOrderFindOwnedQuery): Promise<Nullable<OrderModel>> {
    const { orderId, customerId } = query;
    const order = await this.orderRepository.findOneBy({ id: orderId, customerId });

    if (order === null) {
      return null;
    }

    const products = await this.orderProductRepository
      .createQueryBuilder('OrderProduct')
      .select('OrderProduct.id', 'id')
      .addSelect('OrderProduct.productId', 'productId')
      .addSelect('Product.sku', 'sku')
      .addSelect('Product.name', 'name')
      .innerJoin(Product, 'Product', 'Product.id = OrderProduct.productId')
      .where('OrderProduct.orderId = :orderId', { orderId })
      .orderBy('OrderProduct.id', 'ASC')
      .withDeleted()
      .getRawMany<IOrderProductRecord>();

    return OrderMapper.toModel(order, products);
  }
}
