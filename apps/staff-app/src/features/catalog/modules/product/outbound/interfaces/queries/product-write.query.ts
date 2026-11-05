import { Product } from '@acme-core/entities';

export interface IProductWriteUpdateQuery extends Pick<
  Product,
  'id' | 'name' | 'status' | 'version'
> {
  versionAsRead: number;
}
