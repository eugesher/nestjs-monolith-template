import { IProductStockCoreMovementInsertCommand, IProductStockCoreSumView } from '../interfaces';

export interface IProductStockCoreMoveRepositoryPort {
  lockProducts(productIds: string[]): Promise<string[]>;
  insertMany(commands: IProductStockCoreMovementInsertCommand[]): Promise<string[]>;
  sumStock(productIds: string[]): Promise<IProductStockCoreSumView[]>;
}

export const PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT',
);
