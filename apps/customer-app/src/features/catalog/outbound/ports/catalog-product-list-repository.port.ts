import { IPage } from '@acme-libs/toolkit';

import { ICatalogPageQuery, ICatalogProductRowRecord } from '../interfaces';

export interface ICatalogProductListRepositoryPort {
  list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductRowRecord>>;
}

export const CATALOG_PRODUCT_LIST_REPOSITORY_PORT = Symbol('CATALOG_PRODUCT_LIST_REPOSITORY_PORT');
