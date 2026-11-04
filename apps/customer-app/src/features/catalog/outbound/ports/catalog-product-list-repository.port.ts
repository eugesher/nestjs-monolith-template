import { ICatalogPageQuery, ICatalogProductRowRecord } from '../interfaces';

export interface ICatalogProductListRepositoryPort {
  list(query: ICatalogPageQuery): Promise<[ICatalogProductRowRecord[], number]>;
}

export const CATALOG_PRODUCT_LIST_REPOSITORY_PORT = Symbol('CATALOG_PRODUCT_LIST_REPOSITORY_PORT');
