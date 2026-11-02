import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IPage } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { ProductModel } from '../../../domain';
import { type IProductCrudRepositoryPort, IProductPageQuery } from '../../../outbound';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductCrudRepository implements IProductCrudRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
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
