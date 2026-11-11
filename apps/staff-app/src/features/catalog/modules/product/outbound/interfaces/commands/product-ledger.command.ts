import { ProductPublishedEvent } from '../../../domain';

export interface IProductLedgerRecordEventsCommand {
  events: ProductPublishedEvent[];
}

export interface IProductLedgerRecordCreatedCommand {
  productId: string;
  sku: string;
  name: string;
}
