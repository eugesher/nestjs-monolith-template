import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { Order, OrderProduct, Product } from '@acme-core/entities';

import { OrderModel } from '../../../domain';
import { type IOrderPlaceRepositoryPort, IOrderPlaceProductView } from '../../../outbound';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderPlaceRepository implements IOrderPlaceRepositoryPort {
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

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductView[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id', 'Product.sku', 'Product.name'])
      .where('Product.id IN (:...productIds)', { productIds })
      .andWhere('Product.status = :status', { status: ProductStatusEnum.ACTIVE })
      .getMany();

    return products.map((product) => {
      const { id, sku, name } = product;

      return { productId: id, sku, name };
    });
  }

  public async insert(order: OrderModel): Promise<OrderModel> {
    const { customerId, products } = order;
    const result = await this.orderRepository.insert({ customerId });
    const [identifier] = result.identifiers as { id: number | string }[];
    const orderId = String(identifier.id);
    const lines = products.map((product) => ({ orderId, productId: product.productId }));

    await this.orderProductRepository.insert(lines);

    const stored = await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .where('Order.id = :orderId', { orderId })
      .getOneOrFail();
    const rows = await this.orderProductRepository
      .createQueryBuilder('OrderProduct')
      .select(['OrderProduct.id', 'OrderProduct.productId'])
      .where('OrderProduct.orderId = :orderId', { orderId })
      .orderBy('OrderProduct.id', 'ASC')
      .getMany();
    const records = rows.map((row) => {
      const { id, productId } = row;
      const product = products.find((candidate) => candidate.productId === productId);

      return { id, productId, sku: product?.sku ?? '', name: product?.name ?? '' };
    });

    return OrderMapper.toModel(stored, records);
  }
}
