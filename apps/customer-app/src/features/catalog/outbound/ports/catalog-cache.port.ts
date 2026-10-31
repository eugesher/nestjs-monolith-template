import { IPage } from '@acme-libs/toolkit';
import { ICatalogCacheReadQuery, ICatalogProductStockView } from '../interfaces';

export interface ICatalogCachePort {
  read(query: ICatalogCacheReadQuery): Promise<IPage<ICatalogProductStockView>>;
}

export const CATALOG_CACHE_PORT = Symbol('CATALOG_CACHE_PORT');
