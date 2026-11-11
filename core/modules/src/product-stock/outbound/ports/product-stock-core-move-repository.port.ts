import type {
  IProductStockCoreMoveInsertQuery,
  IProductStockCoreMoveInsertRecord,
  IProductStockCoreMoveProductRecord,
  IProductStockCoreMoveSumRecord,
} from '../interfaces';

export interface IProductStockCoreMoveRepositoryPort {
  lockProducts(productIds: string[]): Promise<IProductStockCoreMoveProductRecord[]>;
  insertMany(
    queries: IProductStockCoreMoveInsertQuery[],
  ): Promise<IProductStockCoreMoveInsertRecord[]>;
  sumStock(productIds: string[]): Promise<IProductStockCoreMoveSumRecord[]>;
}

export const PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT',
);
