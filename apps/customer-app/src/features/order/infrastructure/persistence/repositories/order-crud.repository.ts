import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Order, OrderProduct, Product } from '@acme-core/entities';
import { IPage, Nullable } from '@acme-libs/toolkit';
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
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get orderRepository(): Repository<Order> {
    return this.transactionHost.tx.getRepository(Order);
  }

  private get orderProductRepository(): Repository<OrderProduct> {
    return this.transactionHost.tx.getRepository(OrderProduct);
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
      .createQueryBuilder('line')
      .select('line.id', 'id')
      .addSelect('line.productId', 'productId')
      .addSelect('product.sku', 'sku')
      .addSelect('product.name', 'name')
      .innerJoin(Product, 'product', 'product.id = line.productId')
      .where('line.orderId = :orderId', { orderId })
      .orderBy('line.id', 'ASC')
      .withDeleted()
      .getRawMany<IOrderProductRecord>();

    return OrderMapper.toModel(order, products);
  }
}
