import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import { IProductAccessRepositoryPort, PRODUCT_ACCESS_REPOSITORY_PORT } from '../../../outbound';
import { ProductBaseRepository } from './base/product-base.repository';

@Injectable()
export class ProductAccessRepository
  extends ProductBaseRepository
  implements IProductAccessRepositoryPort
{
  public static readonly provider: ClassProvider<IProductAccessRepositoryPort> = {
    provide: PRODUCT_ACCESS_REPOSITORY_PORT,
    useClass: ProductAccessRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }
}
