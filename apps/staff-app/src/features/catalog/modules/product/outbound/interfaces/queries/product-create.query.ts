import { Product } from '@acme-core/entities';

export type IProductCreateInsertQuery = Pick<Product, 'sku' | 'name' | 'status' | 'version'>;
