import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LEDGER_LIB_PORT, type ILedgerLibPort } from '@acme-libs/contracts/ledger';

import {
  IProductStockLedgerPort,
  IProductStockLedgerRecordEventsCommand,
  PRODUCT_STOCK_LEDGER_PORT,
} from '../../outbound';

@Injectable()
export class ProductStockLedgerLibAdapter implements IProductStockLedgerPort {
  public static readonly provider: ClassProvider<IProductStockLedgerPort> = {
    provide: PRODUCT_STOCK_LEDGER_PORT,
    useClass: ProductStockLedgerLibAdapter,
  };

  constructor(
    @Inject(LEDGER_LIB_PORT)
    private readonly ledger: ILedgerLibPort,
  ) {}

  public async recordEvents(command: IProductStockLedgerRecordEventsCommand): Promise<void> {
    const { productStockId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductStockLedgerLibAdapter.name);

    for (const event of events) {
      const record = event.toLedgerRecord(productStockId, correlationId);

      await this.ledger.handleEnqueue(record);
    }
  }
}
