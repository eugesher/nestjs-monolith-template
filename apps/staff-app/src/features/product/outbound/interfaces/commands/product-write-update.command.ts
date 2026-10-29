import { ProductModel } from '../../../domain';

export interface IProductWriteUpdateCommand {
  product: ProductModel;
  versionAsRead: number;
}
