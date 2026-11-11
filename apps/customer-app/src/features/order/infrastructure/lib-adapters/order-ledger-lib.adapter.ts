import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LEDGER_LIB_PORT, type ILedgerLibPort } from '@acme-libs/contracts/ledger';

import {
  ORDER_LEDGER_PORT,
  type IOrderLedgerPort,
  type IOrderLedgerRecordPlacedCommand,
} from '../../outbound';

@Injectable()
export class OrderLedgerLibAdapter implements IOrderLedgerPort {
  public static readonly provider: ClassProvider<IOrderLedgerPort> = {
    provide: ORDER_LEDGER_PORT,
    useClass: OrderLedgerLibAdapter,
  };

  constructor(
    @Inject(LEDGER_LIB_PORT)
    private readonly ledger: ILedgerLibPort,
  ) {}

  public async recordPlaced(command: IOrderLedgerRecordPlacedCommand): Promise<void> {
    const { orderId, customerId, productIds } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(OrderLedgerLibAdapter.name);

    await this.ledger.handleEnqueue({
      operationKey: `order-placed:${orderId}`,
      subjectType: 'order',
      subjectId: orderId,
      action: 'OrderPlaced',
      payload: { customerId, productIds },
      occurredAt,
      correlationId,
    });
  }
}
