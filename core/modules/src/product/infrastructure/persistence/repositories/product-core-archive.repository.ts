import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Product } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { ProductCoreModel } from '../../../domain';
import {
  type IProductCoreArchiveRepositoryPort,
  IProductCoreWriteUpdateCommand,
} from '../../../outbound';
import { ProductCoreMapper } from '../mappers/product-core.mapper';

@Injectable()
export class ProductCoreArchiveRepository implements IProductCoreArchiveRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get products(): Repository<Product> {
    return this.txHost.tx.getRepository(Product);
  }

  public async lockById(productId: string): Promise<Nullable<ProductCoreModel>> {
    const product = await this.products
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();

    return product === null ? null : ProductCoreMapper.toModel(product);
  }

  public async update(command: IProductCoreWriteUpdateCommand): Promise<void> {
    const { product, versionAsRead } = command;

    await this.products.update(
      { id: product.id, version: versionAsRead },
      { status: product.status, version: product.version },
    );
  }
}
