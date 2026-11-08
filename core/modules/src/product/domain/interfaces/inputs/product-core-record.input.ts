import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductCoreRecordInput {
  id: string;
  sku: string;
  status: ProductStatusEnum;
  version: number;
}
