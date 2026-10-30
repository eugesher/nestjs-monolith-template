import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IOrderStock {
  productId: string;
  sku: string;
  name: string;
  status: ProductStatusEnum;
  quantity: number;
}
