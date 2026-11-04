import { IProductFoundRecord, IProductInsertQuery } from '../interfaces';

export interface IProductCreateRepositoryPort {
  existsBySku(sku: string): Promise<boolean>;
  insert(query: IProductInsertQuery): Promise<string>;
  findInserted(productId: string): Promise<IProductFoundRecord>;
}

export const PRODUCT_CREATE_REPOSITORY_PORT = Symbol('PRODUCT_CREATE_REPOSITORY_PORT');
