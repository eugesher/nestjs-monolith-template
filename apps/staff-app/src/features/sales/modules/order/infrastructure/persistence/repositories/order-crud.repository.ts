import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Order, OrderProduct, Product } from '@acme-core/entities';
import { IPage, Nullable } from '@acme-libs/toolkit';
import {
  type IOrderCrudRepositoryPort,
  IOrderFoundProductView,
  IOrderFoundView,
  IOrderListedView,
  IOrderPageQuery,
} from '../../../outbound';

@Injectable()
export class OrderCrudRepository implements IOrderCrudRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get orderRepository(): Repository<Order> {
    return this.transactionHost.tx.getRepository(Order);
  }

  private get orderProductRepository(): Repository<OrderProduct> {
    return this.transactionHost.tx.getRepository(OrderProduct);
  }

  public async list(query: IOrderPageQuery): Promise<IPage<IOrderListedView>> {
    const { page, size } = query;
    const [orders, total] = await this.orderRepository.findAndCount({
      select: { id: true, customerId: true, createdAt: true },
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    const items = orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt,
    }));

    return { items, total, page, size };
  }

  public async findById(orderId: string): Promise<Nullable<IOrderFoundView>> {
    const order = await this.orderRepository.findOneBy({ id: orderId });

    if (order === null) {
      return null;
    }

    const products = await this.orderProductRepository
      .createQueryBuilder('line')
      .select('line.id', 'id')
      .addSelect('line.productId', 'productId')
      .addSelect('product.sku', 'sku')
      .addSelect('product.name', 'name')
      .innerJoin(Product, 'product', 'product.id = line.productId')
      .where('line.orderId = :orderId', { orderId })
      .orderBy('line.id', 'ASC')
      .withDeleted()
      .getRawMany<IOrderFoundProductView>();

    return { id: order.id, customerId: order.customerId, createdAt: order.createdAt, products };
  }
}
