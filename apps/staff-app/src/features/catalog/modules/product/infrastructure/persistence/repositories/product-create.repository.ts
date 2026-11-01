import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MysqlErrorHelper, RepositoryHost } from '@acme-libs/database';
import { Product } from '@acme-core/entities';

import { ProductDomainException, ProductErrorCodeEnum, ProductModel } from '../../../domain';
import { type IProductCreateRepositoryPort } from '../../../outbound';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductCreateRepository implements IProductCreateRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async existsBySku(sku: string): Promise<boolean> {
    return await this.productRepository.exists({ where: { sku } });
  }

  public async insert(product: ProductModel): Promise<ProductModel> {
    const { sku, name, status, version } = product;

    try {
      await this.productRepository.insert({ sku, name, status, version });
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_SKU_TAKEN,
        `Product sku ${sku} is already registered`,
      );
    }

    const stored = await this.productRepository.findOneOrFail({ where: { sku } });

    return ProductMapper.toModel(stored);
  }
}
