import { ItemModel } from '../../domain';

export interface IItemCreateRepositoryPort {
  existsBySku(sku: string): Promise<boolean>;
  insert(item: ItemModel): Promise<ItemModel>;
}

export const ITEM_CREATE_REPOSITORY_PORT = Symbol('ITEM_CREATE_REPOSITORY_PORT');
