import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Product, ProductStock } from '@acme-core/entities';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { IPage } from '@acme-libs/toolkit';
import {
  type ICatalogCrudRepositoryPort,
  ICatalogPageQuery,
  ICatalogProductStockView,
} from '../../../outbound';

@Injectable()
export class CatalogCrudRepository implements ICatalogCrudRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get products(): Repository<Product> {
    return this.txHost.tx.getRepository(Product);
  }

  public async list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductStockView>> {
    const { page, size } = query;
    const inStock = this.inStock();
    const rows = await inStock
      .clone()
      .orderBy('product.id', 'ASC')
      .offset((page - 1) * size)
      .limit(size)
      .getRawMany<{ id: string; sku: string; name: string; quantity: number | string }>();
    const count = await this.txHost.tx
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from(`(${inStock.getQuery()})`, 'in_stock')
      .setParameters(inStock.getParameters())
      .getRawOne<{ total: number | string }>();

    return {
      items: rows.map((row) => ({ ...row, quantity: Number(row.quantity) })),
      total: Number(count?.total ?? 0),
      page,
      size,
    };
  }

  private inStock(): SelectQueryBuilder<Product> {
    return this.products
      .createQueryBuilder('product')
      .select('product.id', 'id')
      .addSelect('product.sku', 'sku')
      .addSelect('product.name', 'name')
      .addSelect('SUM(stock.quantity)', 'quantity')
      .innerJoin(ProductStock, 'stock', 'stock.productId = product.id')
      .where('product.status = :status', { status: ProductStatusEnum.ACTIVE })
      .groupBy('product.id')
      .having('SUM(stock.quantity) > 0');
  }
}
