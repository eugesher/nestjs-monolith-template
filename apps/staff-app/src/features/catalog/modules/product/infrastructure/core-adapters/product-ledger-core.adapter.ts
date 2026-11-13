import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { LEDGER_CORE_PORT, type ILedgerCorePort } from '@acme-core/contracts/ledger';

import {
  PRODUCT_LEDGER_PORT,
  type IProductLedgerPort,
  type IProductLedgerRecordCreatedCommand,
  type IProductLedgerRecordEventsCommand,
} from '../../outbound';

@Injectable()
export class ProductLedgerCoreAdapter implements IProductLedgerPort {
  public static readonly provider: ClassProvider<IProductLedgerPort> = {
    provide: PRODUCT_LEDGER_PORT,
    useClass: ProductLedgerCoreAdapter,
  };

  constructor(
    @Inject(LEDGER_CORE_PORT)
    private readonly ledger: ILedgerCorePort,
  ) {}

  public async recordCreated(command: IProductLedgerRecordCreatedCommand): Promise<void> {
    const { productId, sku, name } = command;
    const occurredAt = new Date().toISOString();

    await this.ledger.handleEnqueue({
      operationKey: `product-created:${productId}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductCreated',
      payload: { sku, name },
      occurredAt,
    });
  }

  public async recordEvents(command: IProductLedgerRecordEventsCommand): Promise<void> {
    const { events } = command;

    for (const event of events) {
      const record = event.toLedgerRecord();

      await this.ledger.handleEnqueue(record);
    }
  }
}
