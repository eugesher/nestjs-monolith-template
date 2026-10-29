import { DomainEvent, Maybe } from '@acme-libs/toolkit';
import { ItemModel } from '../../../domain';

export interface IItemWriteView {
  item: ItemModel;
  events: DomainEvent<Maybe<string>>[];
}
