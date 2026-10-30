import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Product, ProductStock } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { ProductModel } from '../../../domain';
import {
  type IProductRestockRepositoryPort,
  IProductRestockInsertCommand,
} from '../../../outbound';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductRestockRepository implements IProductRestockRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get products(): Repository<Product> {
    return this.txHost.tx.getRepository(Product);
  }

  private get stock(): Repository<ProductStock> {
    return this.txHost.tx.getRepository(ProductStock);
  }

  public async lockById(productId: string): Promise<Nullable<ProductModel>> {
    const product = await this.products
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();

    return product === null ? null : ProductMapper.toModel(product);
  }

  public async insertStock(command: IProductRestockInsertCommand): Promise<string> {
    const { productId, quantity } = command;
    const result = await this.stock.insert({ productId, quantity, orderProductId: null });
    const [identifier] = result.identifiers as { id: number | string }[];

    return String(identifier.id);
  }

  public async sumStock(productId: string): Promise<number> {
    const row = await this.stock
      .createQueryBuilder('stock')
      .select('COALESCE(SUM(stock.quantity), 0)', 'quantity')
      .where('stock.productId = :productId', { productId })
      .setLock('pessimistic_read')
      .getRawOne<{ quantity: number | string }>();

    return Number(row?.quantity ?? 0);
  }
}
