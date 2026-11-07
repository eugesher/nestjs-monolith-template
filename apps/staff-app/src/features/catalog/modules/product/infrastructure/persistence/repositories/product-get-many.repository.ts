import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IProductGetManyListQuery,
  IProductGetManyRecord,
  IProductGetManyRepositoryPort,
  PRODUCT_GET_MANY_REPOSITORY_PORT,
} from '../../../outbound';
import { ProductPersistenceHost } from '../host/product-persistence.host';

@Injectable()
export class ProductGetManyRepository
  extends ProductPersistenceHost
  implements IProductGetManyRepositoryPort
{
  public static readonly provider: ClassProvider<IProductGetManyRepositoryPort> = {
    provide: PRODUCT_GET_MANY_REPOSITORY_PORT,
    useClass: ProductGetManyRepository,
  };

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
