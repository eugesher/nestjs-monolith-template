import type { ProductStockAddedEvent } from '../../../domain';

export interface IProductStockLedgerRecordEventsCommand {
  productStockId: string;
  events: ProductStockAddedEvent[];
}
