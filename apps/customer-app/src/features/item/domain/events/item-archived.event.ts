import { ItemStatusEnum } from '@acme-libs/kernel';
import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ItemArchivedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    itemId: Maybe<string>,
    public readonly sku: string,
    public readonly previousStatus: ItemStatusEnum,
  ) {
    super(itemId);
  }
}
