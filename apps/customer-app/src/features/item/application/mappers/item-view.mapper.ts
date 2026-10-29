import { ItemModel } from '../../domain';
import { IItemView } from '../interfaces/views/item.view';

export class ItemViewMapper {
  public static toView(item: ItemModel): IItemView {
    const now = new Date();
    const createdAt = item.createdAt ?? now;
    const updatedAt = item.updatedAt ?? now;

    return {
      id: item.id ?? '',
      sku: item.sku,
      name: item.name,
      status: item.status,
      version: item.version,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
