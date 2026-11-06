import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IProductGetManyRepositoryPort,
  IProductGetManyRecord,
  IProductGetManyListQuery,
} from '../../../outbound';
import { ProductPersistenceHost } from '../host/product-persistence.host';

@Injectable()
export class ProductGetManyRepository
  extends ProductPersistenceHost
  implements IProductGetManyRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: IProductGetManyListQuery): Promise<IProductGetManyRecord> {
    return await this.createProductBuilder().forList(query).getManyAndCount();
  }
}
