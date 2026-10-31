import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Product } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { ProductModel } from '../../../../domain';
import { ProductMapper } from '../../mappers/product.mapper';

export abstract class ProductFindByIdBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get products(): Repository<Product> {
    return this.txHost.tx.getRepository(Product);
  }

  public async findById(productId: string): Promise<Nullable<ProductModel>> {
    const product = await this.products.findOne({ where: { id: productId } });

    return product === null ? null : ProductMapper.toModel(product);
  }
}
