import { IProductStockOnHandLockCommand, IProductStockOnHandView } from '../interfaces';

export interface IProductStockOnHandPort {
  lock(command: IProductStockOnHandLockCommand): Promise<IProductStockOnHandView[]>;
}

export const PRODUCT_STOCK_ON_HAND_PORT = Symbol('PRODUCT_STOCK_ON_HAND_PORT');
