import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IProductCoreArchiveRecord,
  IProductCoreArchiveRepositoryPort,
  IProductCoreArchiveUpdateQuery,
  PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
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
