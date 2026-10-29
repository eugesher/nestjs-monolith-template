import { IPage } from '@acme-libs/toolkit';
import { ItemModel } from '../../domain';
import { IItemPageQuery } from '../interfaces';

export interface IItemCrudRepositoryPort {
  list(query: IItemPageQuery): Promise<IPage<ItemModel>>;
}

export const ITEM_CRUD_REPOSITORY_PORT = Symbol('ITEM_CRUD_REPOSITORY_PORT');
