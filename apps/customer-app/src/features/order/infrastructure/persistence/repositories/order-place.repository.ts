import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Order, OrderProduct, Product, ProductStock } from '@acme-core/entities';
import { IOrderStock, OrderModel } from '../../../domain';
import { type IOrderPlaceRepositoryPort } from '../../../outbound';
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

  private get stock(): Repository<ProductStock> {
    return this.txHost.tx.getRepository(ProductStock);
  }

  public async lockStock(productIds: string[]): Promise<IOrderStock[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.products
      .createQueryBuilder('product')
      .where('product.id IN (:...productIds)', { productIds })
      .orderBy('product.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();
    const quantities = await this.stock
      .createQueryBuilder('stock')
      .select('stock.productId', 'productId')
      .addSelect('SUM(stock.quantity)', 'quantity')
      .where('stock.productId IN (:...productIds)', { productIds })
      .groupBy('stock.productId')
      .setLock('pessimistic_read')
      .getRawMany<{ productId: string; quantity: number | string }>();

    return products.map((product) => {
      const { id, sku, name, status } = product;
      const onHand = quantities.find((row) => row.productId === id);

      return { productId: id, sku, name, status, quantity: Number(onHand?.quantity ?? 0) };
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
    const movements = rows.map((row) => ({
      productId: row.productId,
      quantity: -1,
      orderProductId: row.id,
    }));

    await this.stock.insert(movements);

    const records = rows.map((row) => {
      const { id, productId } = row;
      const product = products.find((candidate) => candidate.productId === productId);

      return { id, productId, sku: product?.sku ?? '', name: product?.name ?? '' };
    });

    return OrderMapper.toModel(stored, records);
  }
}
