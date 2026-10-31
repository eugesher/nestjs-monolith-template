import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Product } from '@acme-core/entities';
import { MysqlErrorHelper } from '@acme-libs/database';
import { ProductDomainException, ProductErrorCodeEnum, ProductModel } from '../../../domain';
import { type IProductCreateRepositoryPort } from '../../../outbound';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductCreateRepository implements IProductCreateRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get productRepository(): Repository<Product> {
    return this.transactionHost.tx.getRepository(Product);
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
