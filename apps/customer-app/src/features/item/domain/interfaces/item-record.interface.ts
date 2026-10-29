import { ItemStatusEnum } from '@acme-libs/kernel';

export interface IItemRecord {
  id: string;
  sku: string;
  name: string;
  ownerId: string;
  status: ItemStatusEnum;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
