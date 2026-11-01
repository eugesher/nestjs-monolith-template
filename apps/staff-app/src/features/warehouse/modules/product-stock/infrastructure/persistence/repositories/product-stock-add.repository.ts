import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { ProductStockModel } from '../../../domain';
import { type IProductStockAddRepositoryPort } from '../../../outbound';
import { ProductStockMapper } from '../mappers/product-stock.mapper';

@Injectable()
export class ProductStockAddRepository implements IProductStockAddRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get productRepository(): Repository<Product> {
    return this.transactionHost.tx.getRepository(Product);
  }

  public async findById(productId: string): Promise<Nullable<ProductStockModel>> {
    const product = await this.productRepository.findOne({
      select: { id: true, sku: true },
      where: { id: productId },
    });

    return product === null ? null : ProductStockMapper.toModel(product);
  }
}
