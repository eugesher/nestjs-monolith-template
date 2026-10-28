import { ItemStatusEnum } from '@acme-libs/kernel';

export interface IItemView {
  id: string;
  sku: string;
  name: string;
  status: ItemStatusEnum;
  version: number;
  createdAt: string;
  updatedAt: string;
}
