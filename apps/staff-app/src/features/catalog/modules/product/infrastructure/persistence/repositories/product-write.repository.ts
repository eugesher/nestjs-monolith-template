import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IProductWriteRepositoryPort, IProductWriteUpdateCommand } from '../../../outbound';
import { ProductBaseRepository } from './base/product-base.repository';

@Injectable()
export class ProductWriteRepository
  extends ProductBaseRepository
  implements IProductWriteRepositoryPort
{
  constructor(@Inject(REPOSITORY_HOST_PORT) repositoryHost: IRepositoryHostPort) {
    super(repositoryHost);
  }

  public async update(command: IProductWriteUpdateCommand): Promise<boolean> {
    const { id, versionAsRead, name, status, version } = command;
    const result = await this.productRepository.update(
      { id, version: versionAsRead },
      { name, status, version },
    );

    return result.affected === 1;
  }
}
