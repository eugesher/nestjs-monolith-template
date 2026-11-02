import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { Order, OrderProduct, Product } from '@acme-core/entities';

import { IOrderDraft, OrderModel } from '../../../domain';
import { IOrderPlaceRepositoryPort, IOrderPlaceProductView } from '../../../outbound';

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

    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id'])
      .where('Product.id IN (:...productIds)', { productIds })
      .andWhere('Product.status = :status', { status: ProductStatusEnum.ACTIVE })
      .getMany();
  }

  public async insert(draft: IOrderDraft): Promise<OrderModel> {
    const { customerId, productIds } = draft;
    const result = await this.orderRepository.insert({ customerId });
    const [identifier] = result.identifiers as { id: number | string }[];
    const orderId = String(identifier.id);
    const lines = productIds.map((productId) => ({ orderId, productId }));

    await this.orderProductRepository.insert(lines);

    const stored = await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .leftJoin('Order.orderProducts', 'OrderProduct')
      .addSelect(['OrderProduct.id', 'OrderProduct.productId'])
      .leftJoin('OrderProduct.product', 'Product')
      .addSelect(['Product.id', 'Product.sku', 'Product.name'])
      .where('Order.id = :orderId', { orderId })
      .orderBy('OrderProduct.id', 'ASC')
      .getOneOrFail();
    const products = stored.orderProducts.map((orderProduct) => {
      const { id, productId, product } = orderProduct;

      return { id, productId, sku: product.sku, name: product.name };
    });

    return OrderModel.reconstitute({
      id: stored.id,
      customerId: stored.customerId,
      createdAt: stored.createdAt,
      products,
    });
  }
}
