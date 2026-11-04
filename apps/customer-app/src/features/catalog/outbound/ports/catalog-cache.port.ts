import { IPage } from '@acme-libs/toolkit';

import { ICatalogCacheReadCommand, ICatalogProductRowView } from '../interfaces';

export interface ICatalogCachePort {
  read(command: ICatalogCacheReadCommand): Promise<IPage<ICatalogProductRowView>>;
}

export const CATALOG_CACHE_PORT = Symbol('CATALOG_CACHE_PORT');
