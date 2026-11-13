import type { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductGetManySnapshotOutput {
  id: string;
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
  createdAt: string;
  updatedAt: string;
}
