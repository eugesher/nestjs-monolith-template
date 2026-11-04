import { IOrderListedRecord } from '../../outbound';
import { IOrderSummaryView } from '../interfaces';

export class OrderViewMapper {
  public static toSummaryView(order: IOrderListedRecord): IOrderSummaryView {
    return {
      id: order.id,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
