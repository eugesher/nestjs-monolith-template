import { Product } from '@acme-core/entities';

export type IProductCoreArchiveRecord = Pick<Product, 'id' | 'sku' | 'status' | 'version'>;
