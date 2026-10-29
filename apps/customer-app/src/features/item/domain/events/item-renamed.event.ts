import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ItemRenamedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    itemId: Maybe<string>,
    public readonly name: string,
    public readonly previousName: string,
  ) {
    super(itemId);
  }
}
