import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import {
  CATALOG_CACHE_PORT,
  CATALOG_CRUD_REPOSITORY_PORT,
  type ICatalogCachePort,
  type ICatalogCrudRepositoryPort,
} from '../../outbound';
import { ICatalogGetManyQuery, ICatalogProductView } from '../interfaces';

@Injectable()
export class CatalogGetManyUseCase {
  constructor(
    @Inject(CATALOG_CRUD_REPOSITORY_PORT)
    private readonly repository: ICatalogCrudRepositoryPort,
    @Inject(CATALOG_CACHE_PORT)
    private readonly cache: ICatalogCachePort,
  ) {}

  public async execute(query: ICatalogGetManyQuery): Promise<IPage<ICatalogProductView>> {
    const { page, size } = query;
    const window = PaginationHelper.clampPageWindow(page, size);

    return await this.cache.read({ ...window, compute: () => this.repository.list({ ...window }) });
  }
}
