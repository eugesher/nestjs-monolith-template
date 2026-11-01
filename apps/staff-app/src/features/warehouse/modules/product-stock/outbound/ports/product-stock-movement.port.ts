import {
  IProductStockMovementAddCommand,
  IProductStockMovementAddView,
  IProductStockMovementLockCommand,
} from '../interfaces';

export interface IProductStockMovementPort {
  lock(command: IProductStockMovementLockCommand): Promise<void>;
  add(command: IProductStockMovementAddCommand): Promise<IProductStockMovementAddView>;
}

export const PRODUCT_STOCK_MOVEMENT_PORT = Symbol('PRODUCT_STOCK_MOVEMENT_PORT');
