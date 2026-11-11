import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT,
  type IProductCoreArchiveRecord,
  type IProductCoreArchiveRepositoryPort,
  type IProductCoreArchiveUpdateQuery,
} from '../../../outbound';
import { ProductCorePersistenceHost } from '../host/product-core-persistence.host';

@Injectable()
export class ProductCoreArchiveRepository
  extends ProductCorePersistenceHost
  implements IProductCoreArchiveRepositoryPort
{
  public static readonly provider: ClassProvider<IProductCoreArchiveRepositoryPort> = {
    provide: PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT,
    useClass: ProductCoreArchiveRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async lockById(productId: string): Promise<Nullable<IProductCoreArchiveRecord>> {
    return await this.createProductBuilder().forLockById(productId).getOne();
  }

  public async update(query: IProductCoreArchiveUpdateQuery): Promise<void> {
    const { id, versionAsRead, status, version } = query;

    await this.productRepository.update({ id, version: versionAsRead }, { status, version });
  }
}
