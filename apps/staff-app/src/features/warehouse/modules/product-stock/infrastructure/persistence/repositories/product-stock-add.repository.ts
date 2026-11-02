import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { ProductStockModel } from '../../../domain';
import { type IProductStockAddRepositoryPort } from '../../../outbound';
import { ProductStockMapper } from '../mappers/product-stock.mapper';

@Injectable()
export class ProductStockAddRepository implements IProductStockAddRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findById(productId: string): Promise<Nullable<ProductStockModel>> {
    const product = await this.productRepository.findOne({
      select: { id: true, sku: true },
      where: { id: productId },
    });

    return product === null ? null : ProductStockMapper.toModel(product);
  }
}
