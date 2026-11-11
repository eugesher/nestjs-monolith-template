import type { Product } from '@acme-core/entities';

export type IProductGetManyRecord = [
  Pick<Product, 'id' | 'sku' | 'name' | 'status' | 'version' | 'createdAt' | 'updatedAt'>[],
  number,
];
