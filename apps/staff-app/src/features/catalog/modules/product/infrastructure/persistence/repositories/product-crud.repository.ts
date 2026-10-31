import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Product } from '@acme-core/entities';
import { IPage } from '@acme-libs/toolkit';
import { ProductModel } from '../../../domain';
import { type IProductCrudRepositoryPort, IProductPageQuery } from '../../../outbound';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductCrudRepository implements IProductCrudRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get productRepository(): Repository<Product> {
    return this.transactionHost.tx.getRepository(Product);
  }

  public async list(query: IProductPageQuery): Promise<IPage<ProductModel>> {
    const { page, size } = query;
    const [items, total] = await this.productRepository.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: items.map((product) => ProductMapper.toModel(product)),
      total,
      page,
      size,
    };
  }
}
