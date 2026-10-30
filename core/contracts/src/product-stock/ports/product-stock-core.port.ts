import {
  IProductStockCoreLockCommand,
  IProductStockCoreMoveCommand,
  IProductStockCoreMoveView,
  IProductStockCoreOnHandView,
} from '../interfaces';

export interface IProductStockCorePort {
  lock(command: IProductStockCoreLockCommand): Promise<IProductStockCoreOnHandView[]>;
  move(command: IProductStockCoreMoveCommand): Promise<IProductStockCoreMoveView>;
}

export const PRODUCT_STOCK_CORE_PORT = Symbol('PRODUCT_STOCK_CORE_PORT');
