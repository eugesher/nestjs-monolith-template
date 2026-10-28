import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export interface IItemEventsPublishCommand {
  itemId: string;
  events: DomainEvent<Maybe<string>>[];
}
