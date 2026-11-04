import { IOrderMovement } from '../../../domain';

export interface IOrderProductStockLockCommand {
  productIds: string[];
}

export interface IOrderProductStockWithdrawCommand {
  movements: IOrderMovement[];
}
