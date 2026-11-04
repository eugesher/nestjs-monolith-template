import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductInsertQuery {
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
}
