import { Injectable } from '@nestjs/common';

import { RepositoryHost } from '@acme-libs/database';

import { type IProductWriteRepositoryPort, IProductWriteUpdateCommand } from '../../../outbound';
import { ProductFindByIdBaseRepository } from './base/product-find-by-id-base.repository';

@Injectable()
export class ProductWriteRepository
  extends ProductFindByIdBaseRepository
  implements IProductWriteRepositoryPort
{
  constructor(repositoryHost: RepositoryHost) {
    super(repositoryHost);
  }

  public async update(command: IProductWriteUpdateCommand): Promise<boolean> {
    const { product, versionAsRead } = command;
    const result = await this.productRepository.update(
      { id: product.id, version: versionAsRead },
      { name: product.name, status: product.status, version: product.version },
    );

    return result.affected === 1;
  }
}
