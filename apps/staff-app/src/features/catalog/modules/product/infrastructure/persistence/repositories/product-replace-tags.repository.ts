import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  PRODUCT_REPLACE_TAGS_REPOSITORY_PORT,
  type IProductReplaceTagsRecord,
  type IProductReplaceTagsRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async lockById(productId: string): Promise<Nullable<IProductReplaceTagsRecord>> {
    return await this.createProductBuilder().forLockById(productId).getOne();
  }
}
