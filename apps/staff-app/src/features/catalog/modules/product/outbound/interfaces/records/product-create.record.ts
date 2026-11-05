import { Product } from '@acme-core/entities';

export type IProductCreateRecord = Pick<
  Product,
  'id' | 'sku' | 'name' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;
