import { Item } from '@acme-core/entities';
import { ItemModel } from '../../../domain';

export class ItemMapper {
  public static toModel(entity: Item): ItemModel {
    return ItemModel.reconstitute({
      id: entity.id,
      sku: entity.sku,
      name: entity.name,
      ownerId: entity.ownerId,
      status: entity.status,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
