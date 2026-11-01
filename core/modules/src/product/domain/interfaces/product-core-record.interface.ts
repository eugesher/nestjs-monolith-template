import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductCoreRecord {
  id: string;
  sku: string;
  status: ProductStatusEnum;
  version: number;
}
