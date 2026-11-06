import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import { IProductReplaceTagsRecord, IProductReplaceTagsRepositoryPort } from '../../../outbound';
import { ProductPersistenceHost } from '../host/product-persistence.host';

@Injectable()
export class ProductReplaceTagsRepository
  extends ProductPersistenceHost
  implements IProductReplaceTagsRepositoryPort
{
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
