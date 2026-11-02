import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductDraft {
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
}
