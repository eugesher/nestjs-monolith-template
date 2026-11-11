import type { Product } from '@acme-core/entities';

export type ICatalogProductListRecordItem = Pick<Product, 'id' | 'sku' | 'name'>;

export type ICatalogProductListRecord = [ICatalogProductListRecordItem[], number];
