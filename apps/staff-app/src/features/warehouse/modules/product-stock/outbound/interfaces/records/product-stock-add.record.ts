import type { Product } from '@acme-core/entities';

export type IProductStockAddProductRecord = Pick<Product, 'id' | 'sku'>;
