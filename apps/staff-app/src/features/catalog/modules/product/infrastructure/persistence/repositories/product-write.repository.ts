import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IProductWriteRepositoryPort,
  IProductWriteUpdateQuery,
  PRODUCT_WRITE_REPOSITORY_PORT,
} from '../../../outbound';
import { ProductBaseRepository } from './base/product-base.repository';

@Injectable()
export class ProductWriteRepository
  extends ProductBaseRepository
  implements IProductWriteRepositoryPort
{
  public static readonly provider: ClassProvider<IProductWriteRepositoryPort> = {
    provide: PRODUCT_WRITE_REPOSITORY_PORT,
    useClass: ProductWriteRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async update(query: IProductWriteUpdateQuery): Promise<boolean> {
    const { id, versionAsRead, name, status, version } = query;
    const result = await this.productRepository.update(
      { id, version: versionAsRead },
      { name, status, version },
    );

    return result.affected === 1;
  }
}
