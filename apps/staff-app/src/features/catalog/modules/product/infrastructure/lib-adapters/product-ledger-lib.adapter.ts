import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LEDGER_LIB_PORT, type ILedgerLibPort } from '@acme-libs/contracts/ledger';

import {
  IProductLedgerPort,
  IProductLedgerRecordCreatedCommand,
  IProductLedgerRecordEventsCommand,
  PRODUCT_LEDGER_PORT,
} from '../../outbound';

@Injectable()
export class ProductLedgerLibAdapter implements IProductLedgerPort {
  public static readonly provider: ClassProvider<IProductLedgerPort> = {
    provide: PRODUCT_LEDGER_PORT,
    useClass: ProductLedgerLibAdapter,
  };

  constructor(
    @Inject(LEDGER_LIB_PORT)
    private readonly ledger: ILedgerLibPort,
  ) {}

  public async recordCreated(command: IProductLedgerRecordCreatedCommand): Promise<void> {
    const { productId, sku, name } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(ProductLedgerLibAdapter.name);

    await this.ledger.handleEnqueue({
      operationKey: `product-created:${productId}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductCreated',
      payload: { sku, name },
      occurredAt,
      correlationId,
    });
  }

  public async recordEvents(command: IProductLedgerRecordEventsCommand): Promise<void> {
    const { events } = command;
    const correlationId = CorrelationContextHelper.current(ProductLedgerLibAdapter.name);

    for (const event of events) {
      const record = event.toLedgerRecord(correlationId);

      await this.ledger.handleEnqueue(record);
    }
  }
}
