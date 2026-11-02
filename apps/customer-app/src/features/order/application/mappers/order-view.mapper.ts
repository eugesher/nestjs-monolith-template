import { IOrderListedView } from '../../outbound';
import { IOrderSummaryView } from '../interfaces';

export class OrderViewMapper {
  public static toSummaryView(order: IOrderListedView): IOrderSummaryView {
    return {
      id: order.id,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
