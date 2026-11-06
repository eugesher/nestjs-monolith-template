import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IProductAccessRepositoryPort } from '../../../outbound';
import { ProductBaseRepository } from './base/product-base.repository';

@Injectable()
export class ProductAccessRepository
  extends ProductBaseRepository
  implements IProductAccessRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }
}
