import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductDraftOutput {
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
}
