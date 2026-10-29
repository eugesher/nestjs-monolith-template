import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ItemCreatedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    itemId: Maybe<string>,
    public readonly sku: string,
    public readonly name: string,
    public readonly ownerId: string,
  ) {
    super(itemId);
  }
}
