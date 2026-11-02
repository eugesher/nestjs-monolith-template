import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { ProductModel, ProductSkuTakenException } from '../../../domain';
import { type IProductCreateRepositoryPort } from '../../../outbound';

@Injectable()
export class ProductCreateRepository implements IProductCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async existsBySku(sku: string): Promise<boolean> {
    return await this.productRepository
      .createQueryBuilder('Product')
      .where('Product.sku = :sku', { sku })
      .getExists();
  }

  public async insert(product: ProductModel): Promise<ProductModel> {
    const { sku, name, status, version } = product;

    try {
      await this.productRepository.insert({ sku, name, status, version });
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new ProductSkuTakenException(sku);
      }

      throw error;
    }

    const stored = await this.productRepository
      .createQueryBuilder('Product')
      .select([
        'Product.id',
        'Product.sku',
        'Product.name',
        'Product.status',
        'Product.version',
        'Product.createdAt',
        'Product.updatedAt',
      ])
      .where('Product.sku = :sku', { sku })
      .getOneOrFail();

    return ProductModel.reconstitute({
      id: stored.id,
      sku: stored.sku,
      name: stored.name,
      status: stored.status,
      version: stored.version,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    });
  }
}
