import {
  IProductStockCoreMovementInsertedRecord,
  IProductStockCoreMovementInsertQuery,
  IProductStockCoreProductLockedRecord,
  IProductStockCoreSumRecord,
} from '../interfaces';

export interface IProductStockCoreMoveRepositoryPort {
  lockProducts(productIds: string[]): Promise<IProductStockCoreProductLockedRecord[]>;
  insertMany(
    queries: IProductStockCoreMovementInsertQuery[],
  ): Promise<IProductStockCoreMovementInsertedRecord[]>;
  sumStock(productIds: string[]): Promise<IProductStockCoreSumRecord[]>;
}

export const PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT',
);
