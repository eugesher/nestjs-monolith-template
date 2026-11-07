import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IProductReplaceTagsRecord,
  IProductReplaceTagsRepositoryPort,
  PRODUCT_REPLACE_TAGS_REPOSITORY_PORT,
} from '../../../outbound';
import { ProductPersistenceHost } from '../host/product-persistence.host';

@Injectable()
export class ProductReplaceTagsRepository
  extends ProductPersistenceHost
  implements IProductReplaceTagsRepositoryPort
{
  public static readonly provider: ClassProvider<IProductReplaceTagsRepositoryPort> = {
    provide: PRODUCT_REPLACE_TAGS_REPOSITORY_PORT,
    useClass: ProductReplaceTagsRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async lockById(productId: string): Promise<Nullable<IProductReplaceTagsRecord>> {
    return await this.createProductBuilder().forLockById(productId).getOne();
  }
}
