import { IOrderMovement } from '../../../domain';

export interface IOrderProductStockWithdrawCommand {
  movements: IOrderMovement[];
}
