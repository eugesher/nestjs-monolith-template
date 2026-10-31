import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IProductWriteRepositoryPort, IProductWriteUpdateCommand } from '../../../outbound';
import { ProductFindByIdBaseRepository } from './base/product-find-by-id-base.repository';

@Injectable()
export class ProductWriteRepository
  extends ProductFindByIdBaseRepository
  implements IProductWriteRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async update(command: IProductWriteUpdateCommand): Promise<boolean> {
    const { product, versionAsRead } = command;
    const result = await this.products.update(
      { id: product.id, version: versionAsRead },
      { name: product.name, status: product.status, version: product.version },
    );

    return result.affected === 1;
  }
}
