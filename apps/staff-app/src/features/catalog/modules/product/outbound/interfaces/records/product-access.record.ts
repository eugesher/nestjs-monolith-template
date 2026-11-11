import type { Product } from '@acme-core/entities';

export type IProductAccessRecord = Pick<
  Product,
  'id' | 'sku' | 'name' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;
