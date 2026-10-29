import { ItemModel } from '../../../domain';

export interface IItemWriteUpdateCommand {
  item: ItemModel;
  versionAsRead: number;
}
