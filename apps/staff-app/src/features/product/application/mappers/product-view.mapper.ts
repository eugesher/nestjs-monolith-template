import { ProductModel } from '../../domain';
import { IProductView } from '../interfaces/views/product.view';

export class ProductViewMapper {
  public static toView(product: ProductModel): IProductView {
    const now = new Date();
    const createdAt = product.createdAt ?? now;
    const updatedAt = product.updatedAt ?? now;

    return {
      id: product.id ?? '',
      sku: product.sku,
      name: product.name,
      status: product.status,
      version: product.version,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
