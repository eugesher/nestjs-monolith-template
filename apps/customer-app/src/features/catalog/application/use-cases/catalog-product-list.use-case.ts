import { Inject, Injectable } from '@nestjs/common';

import { IPageRequest, PaginationHelper } from '@acme-libs/toolkit';

import {
  CATALOG_CACHE_PORT,
  CATALOG_PRODUCT_LIST_REPOSITORY_PORT,
  type ICatalogCachePort,
  type ICatalogProductListRepositoryPort,
} from '../../outbound';
import { ICatalogProductListCommand, ICatalogProductListView } from '../interfaces';

@Injectable()
export class CatalogProductListUseCase {
  constructor(
    @Inject(CATALOG_PRODUCT_LIST_REPOSITORY_PORT)
    private readonly repository: ICatalogProductListRepositoryPort,
    @Inject(CATALOG_CACHE_PORT)
    private readonly cache: ICatalogCachePort,
  ) {}

  public async execute(command: ICatalogProductListCommand): Promise<ICatalogProductListView> {
    const { page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);

    return await this.cache.read({
      ...pageWindow,
      compute: () => this.listPage(pageWindow),
    });
  }

  private async listPage(pageWindow: IPageRequest): Promise<ICatalogProductListView> {
    const [products, total] = await this.repository.list({ ...pageWindow });

    return PaginationHelper.toPage(products, total, pageWindow);
  }
}
