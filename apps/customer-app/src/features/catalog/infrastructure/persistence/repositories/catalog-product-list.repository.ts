import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  ICatalogProductListRepositoryPort,
  ICatalogProductListQuery,
  ICatalogProductListRecord,
} from '../../../outbound';
import { CatalogPersistenceHost } from '../host/catalog-persistence.host';

@Injectable()
export class CatalogProductListRepository
  extends CatalogPersistenceHost
  implements ICatalogProductListRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: ICatalogProductListQuery): Promise<ICatalogProductListRecord> {
    return await this.createProductBuilder().forList(query).getManyAndCount();
  }
}
