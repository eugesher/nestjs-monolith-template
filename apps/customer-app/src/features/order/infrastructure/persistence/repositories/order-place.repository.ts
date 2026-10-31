import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { Order, OrderProduct, Product } from '@acme-core/entities';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { OrderModel } from '../../../domain';
import { type IOrderPlaceRepositoryPort, IOrderPlaceProductView } from '../../../outbound';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderPlaceRepository implements IOrderPlaceRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get orders(): Repository<Order> {
    return this.txHost.tx.getRepository(Order);
  }

  private get orderProducts(): Repository<OrderProduct> {
    return this.txHost.tx.getRepository(OrderProduct);
  }

  private get products(): Repository<Product> {
    return this.txHost.tx.getRepository(Product);
  }

  public async findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductView[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.products.find({
      where: { id: In(productIds), status: ProductStatusEnum.ACTIVE },
    });

    return products.map((product) => {
      const { id, sku, name } = product;

      return { productId: id, sku, name };
    });
  }

  public async insert(order: OrderModel): Promise<OrderModel> {
    const { customerId, products } = order;
    const draft = this.orders.create({ customerId });
    const stored = await this.orders.save(draft);
    const lines = products.map((product) => ({ orderId: stored.id, productId: product.productId }));

    await this.orderProducts.insert(lines);

    const rows = await this.orderProducts.find({
      where: { orderId: stored.id },
      order: { id: 'ASC' },
    });
    const records = rows.map((row) => {
      const { id, productId } = row;
      const product = products.find((candidate) => candidate.productId === productId);

      return { id, productId, sku: product?.sku ?? '', name: product?.name ?? '' };
    });

    return OrderMapper.toModel(stored, records);
  }
}
