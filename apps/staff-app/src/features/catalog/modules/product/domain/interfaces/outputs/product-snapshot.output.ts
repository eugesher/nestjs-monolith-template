import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductSnapshotOutput {
  id: string;
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
  createdAt: string;
  updatedAt: string;
}
