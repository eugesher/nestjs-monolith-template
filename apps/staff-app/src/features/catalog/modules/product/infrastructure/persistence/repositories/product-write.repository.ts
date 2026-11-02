import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IProductWriteRepositoryPort, IProductWriteUpdateCommand } from '../../../outbound';
import { ProductFindByIdBaseRepository } from './base/product-find-by-id-base.repository';

@Injectable()
export class ProductWriteRepository
  extends ProductFindByIdBaseRepository
  implements IProductWriteRepositoryPort
{
  constructor(@Inject(REPOSITORY_HOST_PORT) repositoryHost: IRepositoryHostPort) {
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
