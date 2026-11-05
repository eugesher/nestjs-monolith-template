import { IOrderGetManyRecordItem } from '../../outbound';
import { IOrderGetManyView } from '../interfaces';

export class OrderViewMapper {
  public static toGetManyViewItem(
    order: IOrderGetManyRecordItem,
  ): IOrderGetManyView['data'][number] {
    return {
      id: order.id,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
