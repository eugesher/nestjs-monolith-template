import {
  IOrderProductStockLockCommand,
  IOrderProductStockView,
  IOrderProductStockWithdrawCommand,
} from '../interfaces';

export interface IOrderProductStockPort {
  lock(command: IOrderProductStockLockCommand): Promise<IOrderProductStockView[]>;
  withdraw(command: IOrderProductStockWithdrawCommand): Promise<void>;
}

export const ORDER_PRODUCT_STOCK_PORT = Symbol('ORDER_PRODUCT_STOCK_PORT');
