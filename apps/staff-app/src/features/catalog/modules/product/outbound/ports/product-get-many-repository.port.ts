import { IProductListedRecord, IProductPageQuery } from '../interfaces';

export interface IProductGetManyRepositoryPort {
  list(query: IProductPageQuery): Promise<[IProductListedRecord[], number]>;
}

export const PRODUCT_GET_MANY_REPOSITORY_PORT = Symbol('PRODUCT_GET_MANY_REPOSITORY_PORT');
