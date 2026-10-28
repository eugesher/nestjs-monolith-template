import { Nullable } from '@acme-libs/toolkit';
import { ItemModel } from '../../domain';

export interface IItemAccessRepositoryPort {
  findById(itemId: string): Promise<Nullable<ItemModel>>;
}

export const ITEM_ACCESS_REPOSITORY_PORT = Symbol('ITEM_ACCESS_REPOSITORY_PORT');
