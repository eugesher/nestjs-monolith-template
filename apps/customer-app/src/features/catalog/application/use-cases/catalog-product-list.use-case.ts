import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper, type IPageWindow } from '@acme-libs/toolkit';

import {
  CATALOG_CACHE_PORT,
  CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN,
  CATALOG_PRODUCT_LIST_REPOSITORY_PORT,
  type ICatalogCachePort,
  type ICatalogProductListRepositoryPort,
} from '../../outbound';
import type { ICatalogProductListCommand, ICatalogProductListView } from '../interfaces';

@Injectable()
export class CatalogProductListUseCase {
  constructor(
    @Inject(CATALOG_PRODUCT_LIST_REPOSITORY_PORT)
    private readonly repository: ICatalogProductListRepositoryPort,
    @Inject(CATALOG_CACHE_PORT)
    private readonly cache: ICatalogCachePort,
    @Inject(CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN)
    private readonly cacheTtlMs: number,
  ) {}

  public async execute(command: ICatalogProductListCommand): Promise<ICatalogProductListView> {
    const pageWindow = PaginationHelper.clampPageWindow({ query: command });
    const { page, limit } = pageWindow;

    return await this.cache.read({
      page,
      limit,
      ttlMs: this.cacheTtlMs,
      compute: () => this.listPage(pageWindow),
    });
  }

  private async listPage(pageWindow: IPageWindow): Promise<ICatalogProductListView> {
    const { page, limit, offset } = pageWindow;
    const [data, total] = await this.repository.list({ limit, offset });

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
