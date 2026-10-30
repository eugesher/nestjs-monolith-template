import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IOrderPlaceProductView {
  productId: string;
  sku: string;
  name: string;
  status: ProductStatusEnum;
}
