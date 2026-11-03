import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductCoreLockedRecord {
  id: string;
  sku: string;
  status: ProductStatusEnum;
  version: number;
}
