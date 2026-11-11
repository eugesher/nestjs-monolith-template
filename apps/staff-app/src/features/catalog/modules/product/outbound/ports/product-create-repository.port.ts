import type {
  IProductCreateInsertQuery,
  IProductCreateInsertRecord,
  IProductCreateRecord,
} from '../interfaces';

export interface IProductCreateRepositoryPort {
  existsBySku(sku: string): Promise<boolean>;
  insert(query: IProductCreateInsertQuery): Promise<IProductCreateInsertRecord>;
  findInserted(productId: string): Promise<IProductCreateRecord>;
}

export const PRODUCT_CREATE_REPOSITORY_PORT = Symbol('PRODUCT_CREATE_REPOSITORY_PORT');
