import { Nullable } from '@acme-libs/toolkit';
import { ItemModel } from '../../domain';
import { IItemWriteUpdateCommand } from '../interfaces';

export interface IItemWriteRepositoryPort {
  findById(itemId: string): Promise<Nullable<ItemModel>>;
  update(command: IItemWriteUpdateCommand): Promise<boolean>;
}

export const ITEM_WRITE_REPOSITORY_PORT = Symbol('ITEM_WRITE_REPOSITORY_PORT');
