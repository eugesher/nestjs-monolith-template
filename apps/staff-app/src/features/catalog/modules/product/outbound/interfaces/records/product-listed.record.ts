import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductListedRecord {
  id: string;
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
