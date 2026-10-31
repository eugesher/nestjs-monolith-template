import { IPage } from '@acme-libs/toolkit';
import { ICatalogPageQuery, ICatalogProductRowView } from '../interfaces';

export interface ICatalogCrudRepositoryPort {
  list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductRowView>>;
}

export const CATALOG_CRUD_REPOSITORY_PORT = Symbol('CATALOG_CRUD_REPOSITORY_PORT');
