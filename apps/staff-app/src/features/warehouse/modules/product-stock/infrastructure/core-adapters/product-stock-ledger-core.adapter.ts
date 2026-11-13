import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { LEDGER_CORE_PORT, type ILedgerCorePort } from '@acme-core/contracts/ledger';

import {
  PRODUCT_STOCK_LEDGER_PORT,
  type IProductStockLedgerPort,
  type IProductStockLedgerRecordEventsCommand,
} from '../../outbound';

@Injectable()
export class ProductStockLedgerCoreAdapter implements IProductStockLedgerPort {
  public static readonly provider: ClassProvider<IProductStockLedgerPort> = {
    provide: PRODUCT_STOCK_LEDGER_PORT,
    useClass: ProductStockLedgerCoreAdapter,
  };

  constructor(
    @Inject(LEDGER_CORE_PORT)
    private readonly ledger: ILedgerCorePort,
  ) {}

  public async recordEvents(command: IProductStockLedgerRecordEventsCommand): Promise<void> {
    const { productStockId, events } = command;

    for (const event of events) {
      const record = event.toLedgerRecord(productStockId);

      await this.ledger.handleEnqueue(record);
    }
  }
}
