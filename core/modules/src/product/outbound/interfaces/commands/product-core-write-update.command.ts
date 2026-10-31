import { ProductCoreModel } from '../../../domain';

export interface IProductCoreWriteUpdateCommand {
  product: ProductCoreModel;
  versionAsRead: number;
}
