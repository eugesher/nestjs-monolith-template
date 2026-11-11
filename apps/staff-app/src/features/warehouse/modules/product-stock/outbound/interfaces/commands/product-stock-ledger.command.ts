import { ProductStockAddedEvent } from '../../../domain';

export interface IProductStockLedgerRecordEventsCommand {
  productStockId: string;
  events: ProductStockAddedEvent[];
}
