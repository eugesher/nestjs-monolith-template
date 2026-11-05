import { ICatalogProductListQuery, ICatalogProductListRecord } from '../interfaces';

export interface ICatalogProductListRepositoryPort {
  list(query: ICatalogProductListQuery): Promise<ICatalogProductListRecord>;
}

export const CATALOG_PRODUCT_LIST_REPOSITORY_PORT = Symbol('CATALOG_PRODUCT_LIST_REPOSITORY_PORT');
