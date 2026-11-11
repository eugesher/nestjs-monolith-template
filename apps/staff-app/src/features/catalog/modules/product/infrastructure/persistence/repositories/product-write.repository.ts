import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  PRODUCT_WRITE_REPOSITORY_PORT,
  type IProductWriteRepositoryPort,
  type IProductWriteUpdateQuery,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
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
