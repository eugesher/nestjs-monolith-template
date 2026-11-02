import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IProductAccessRepositoryPort } from '../../../outbound';
import { ProductFindByIdBaseRepository } from './base/product-find-by-id-base.repository';

@Injectable()
export class ProductAccessRepository
  extends ProductFindByIdBaseRepository
  implements IProductAccessRepositoryPort
{
  constructor(@Inject(REPOSITORY_HOST_PORT) repositoryHost: IRepositoryHostPort) {
    super(repositoryHost);
  }
}
