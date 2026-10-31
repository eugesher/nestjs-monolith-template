import { IPage } from '@acme-libs/toolkit';
import { ICatalogCacheReadQuery, ICatalogProductRowView } from '../interfaces';

export interface ICatalogCachePort {
  read(query: ICatalogCacheReadQuery): Promise<IPage<ICatalogProductRowView>>;
}

export const CATALOG_CACHE_PORT = Symbol('CATALOG_CACHE_PORT');
