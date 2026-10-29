import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export interface IProductEventsPublishCommand {
  productId: string;
  events: DomainEvent<Maybe<string>>[];
}
