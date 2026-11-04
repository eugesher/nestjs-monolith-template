import { IProductStockCoreMovementInsertQuery, IProductStockCoreSumRecord } from '../interfaces';

export interface IProductStockCoreMoveRepositoryPort {
  lockProducts(productIds: string[]): Promise<string[]>;
  insertMany(queries: IProductStockCoreMovementInsertQuery[]): Promise<string[]>;
  sumStock(productIds: string[]): Promise<IProductStockCoreSumRecord[]>;
}

export const PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT',
);
