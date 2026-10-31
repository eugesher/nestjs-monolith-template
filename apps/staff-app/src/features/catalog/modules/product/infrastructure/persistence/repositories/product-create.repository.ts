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
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get products(): Repository<Product> {
    return this.txHost.tx.getRepository(Product);
  }

  public async existsBySku(sku: string): Promise<boolean> {
    return await this.products.exists({ where: { sku } });
  }

  public async insert(product: ProductModel): Promise<ProductModel> {
    const { sku, name, status, version } = product;

    try {
      await this.products.insert({ sku, name, status, version });
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_SKU_TAKEN,
        `Product sku ${sku} is already registered`,
      );
    }

    const stored = await this.products.findOneOrFail({ where: { sku } });

    return ProductMapper.toModel(stored);
  }
}
