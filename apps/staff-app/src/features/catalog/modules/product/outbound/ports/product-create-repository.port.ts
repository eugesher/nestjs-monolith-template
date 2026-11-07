import { IProductCreateInsertQuery, IProductCreateRecord } from '../interfaces';

export interface IProductCreateRepositoryPort {
  existsBySku(sku: string): Promise<boolean>;
  insert(query: IProductCreateInsertQuery): Promise<string>;
  findInserted(productId: string): Promise<IProductCreateRecord>;
}

export const PRODUCT_CREATE_REPOSITORY_PORT = Symbol('PRODUCT_CREATE_REPOSITORY_PORT');
