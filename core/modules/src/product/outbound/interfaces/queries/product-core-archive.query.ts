import { Product } from '@acme-core/entities';

export interface IProductCoreArchiveUpdateQuery extends Pick<Product, 'id' | 'status' | 'version'> {
  versionAsRead: number;
}
