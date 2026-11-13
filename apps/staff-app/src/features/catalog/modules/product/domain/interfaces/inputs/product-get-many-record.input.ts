import type { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductGetManyRecordInput {
  id: string;
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
