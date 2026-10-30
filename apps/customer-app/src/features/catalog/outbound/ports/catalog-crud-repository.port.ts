import { IPage } from '@acme-libs/toolkit';
import { ICatalogPageQuery, ICatalogProductStockView } from '../interfaces';

export interface ICatalogCrudRepositoryPort {
  list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductStockView>>;
}

export const CATALOG_CRUD_REPOSITORY_PORT = Symbol('CATALOG_CRUD_REPOSITORY_PORT');
