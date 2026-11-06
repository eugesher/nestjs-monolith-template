import {
  IProductStockCoreLockCommand,
  IProductStockCoreMoveCommand,
  IProductStockCoreMoveView,
  IProductStockCoreOnHandView,
} from '../interfaces';

export interface IProductStockCorePort {
  handleLock(command: IProductStockCoreLockCommand): Promise<IProductStockCoreOnHandView[]>;
  handleMove(command: IProductStockCoreMoveCommand): Promise<IProductStockCoreMoveView>;
}

export const PRODUCT_STOCK_CORE_PORT = Symbol('PRODUCT_STOCK_CORE_PORT');
