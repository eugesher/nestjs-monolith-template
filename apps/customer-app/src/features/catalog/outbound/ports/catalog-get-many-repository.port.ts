import { IPage } from '@acme-libs/toolkit';

import { ICatalogPageQuery, ICatalogProductRowView } from '../interfaces';

export interface ICatalogGetManyRepositoryPort {
  list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductRowView>>;
}

export const CATALOG_GET_MANY_REPOSITORY_PORT = Symbol('CATALOG_GET_MANY_REPOSITORY_PORT');
