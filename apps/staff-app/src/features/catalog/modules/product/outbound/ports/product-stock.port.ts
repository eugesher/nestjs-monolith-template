import {
  IProductStockLockCommand,
  IProductStockRestockCommand,
  IProductStockRestockView,
} from '../interfaces';

export interface IProductStockPort {
  lock(command: IProductStockLockCommand): Promise<void>;
  restock(command: IProductStockRestockCommand): Promise<IProductStockRestockView>;
}

export const PRODUCT_STOCK_PORT = Symbol('PRODUCT_STOCK_PORT');
