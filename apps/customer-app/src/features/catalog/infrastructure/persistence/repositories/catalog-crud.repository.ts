import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Product } from '@acme-core/entities';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { IPage } from '@acme-libs/toolkit';
import {
  type ICatalogCrudRepositoryPort,
  ICatalogPageQuery,
  ICatalogProductRowView,
} from '../../../outbound';

@Injectable()
export class CatalogCrudRepository implements ICatalogCrudRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get productRepository(): Repository<Product> {
    return this.transactionHost.tx.getRepository(Product);
  }

  public async list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductRowView>> {
    const { page, size } = query;
    const [products, total] = await this.productRepository.findAndCount({
      select: { id: true, sku: true, name: true },
      where: { status: ProductStatusEnum.ACTIVE },
      order: { id: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    });
    const items = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
    }));

    return { items, total, page, size };
  }
}
