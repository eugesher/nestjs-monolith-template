import { Injectable } from '@nestjs/common';

import { RepositoryHost } from '@acme-libs/database';

import { type IProductAccessRepositoryPort } from '../../../outbound';
import { ProductFindByIdBaseRepository } from './base/product-find-by-id-base.repository';

@Injectable()
export class ProductAccessRepository
  extends ProductFindByIdBaseRepository
  implements IProductAccessRepositoryPort
{
  constructor(repositoryHost: RepositoryHost) {
    super(repositoryHost);
  }
}
