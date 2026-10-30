import { Nullable } from '@acme-libs/toolkit';
import { ProductModel } from '../../domain';
import { IProductRestockInsertCommand } from '../interfaces';

export interface IProductRestockRepositoryPort {
  lockById(productId: string): Promise<Nullable<ProductModel>>;
  insertStock(command: IProductRestockInsertCommand): Promise<string>;
  sumStock(productId: string): Promise<number>;
}

export const PRODUCT_RESTOCK_REPOSITORY_PORT = Symbol('PRODUCT_RESTOCK_REPOSITORY_PORT');
