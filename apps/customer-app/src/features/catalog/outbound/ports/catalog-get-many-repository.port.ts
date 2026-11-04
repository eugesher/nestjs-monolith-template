import { IPage } from '@acme-libs/toolkit';

import { ICatalogPageQuery, ICatalogProductRowRecord } from '../interfaces';

export interface ICatalogGetManyRepositoryPort {
  list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductRowRecord>>;
}

export const CATALOG_GET_MANY_REPOSITORY_PORT = Symbol('CATALOG_GET_MANY_REPOSITORY_PORT');
