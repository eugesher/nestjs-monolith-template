import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import {
  CATALOG_CACHE_PORT,
  CATALOG_GET_MANY_REPOSITORY_PORT,
  type ICatalogCachePort,
  type ICatalogGetManyRepositoryPort,
} from '../../outbound';
import { ICatalogGetManyQuery, ICatalogProductView } from '../interfaces';

@Injectable()
export class CatalogGetManyUseCase {
  constructor(
    @Inject(CATALOG_GET_MANY_REPOSITORY_PORT)
    private readonly repository: ICatalogGetManyRepositoryPort,
    @Inject(CATALOG_CACHE_PORT)
    private readonly cache: ICatalogCachePort,
  ) {}

  public async execute(query: ICatalogGetManyQuery): Promise<IPage<ICatalogProductView>> {
    const { page, limit } = query;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);

    return await this.cache.read({
      ...pageWindow,
      compute: () => this.repository.list({ ...pageWindow }),
    });
  }
}
