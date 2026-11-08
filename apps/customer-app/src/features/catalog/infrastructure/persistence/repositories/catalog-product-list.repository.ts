import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  CATALOG_PRODUCT_LIST_REPOSITORY_PORT,
  ICatalogProductListQuery,
  ICatalogProductListRecord,
  ICatalogProductListRepositoryPort,
} from '../../../outbound';
import { CatalogPersistenceHost } from '../host/catalog-persistence.host';

@Injectable()
export class CatalogProductListRepository
  extends CatalogPersistenceHost
  implements ICatalogProductListRepositoryPort
{
  public static readonly provider: ClassProvider<ICatalogProductListRepositoryPort> = {
    provide: CATALOG_PRODUCT_LIST_REPOSITORY_PORT,
    useClass: CatalogProductListRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async list(query: ICatalogProductListQuery): Promise<ICatalogProductListRecord> {
    return await this.createProductBuilder().forList(query).getManyAndCount();
  }
}
