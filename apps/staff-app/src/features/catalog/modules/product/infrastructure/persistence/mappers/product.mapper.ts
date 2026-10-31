import { Product } from '@acme-core/entities';
import { ProductModel } from '../../../domain';

export class ProductMapper {
  public static toModel(entity: Product): ProductModel {
    return ProductModel.reconstitute({
      id: entity.id,
      sku: entity.sku,
      name: entity.name,
      status: entity.status,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
