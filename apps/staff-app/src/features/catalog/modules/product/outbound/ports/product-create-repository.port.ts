import { ProductModel } from '../../domain';

export interface IProductCreateRepositoryPort {
  existsBySku(sku: string): Promise<boolean>;
  insert(product: ProductModel): Promise<ProductModel>;
}

export const PRODUCT_CREATE_REPOSITORY_PORT = Symbol('PRODUCT_CREATE_REPOSITORY_PORT');
