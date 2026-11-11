import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  PRODUCT_ACCESS_REPOSITORY_PORT,
  type IProductAccessRepositoryPort,
} from '../../../outbound';
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }
}
