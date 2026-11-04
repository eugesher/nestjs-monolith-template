import { Product } from '@acme-core/entities';

type IProductGetManyRecordItem = Pick<
  Product,
  'id' | 'sku' | 'name' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;

export type IProductGetManyRecord = [IProductGetManyRecordItem[], number];
