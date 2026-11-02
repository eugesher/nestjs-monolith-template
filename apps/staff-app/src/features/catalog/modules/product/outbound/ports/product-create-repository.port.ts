import { IProductDraft, ProductModel } from '../../domain';

export interface IProductCreateRepositoryPort {
  existsBySku(sku: string): Promise<boolean>;
  insert(draft: IProductDraft): Promise<ProductModel>;
}

export const PRODUCT_CREATE_REPOSITORY_PORT = Symbol('PRODUCT_CREATE_REPOSITORY_PORT');
