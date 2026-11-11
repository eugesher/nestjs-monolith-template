import type { Product } from '@acme-core/entities';

export type IProductWriteRecord = Pick<
  Product,
  'id' | 'sku' | 'name' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;
