import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { SubjectLedgerService } from '@acme-libs/ledger';
import { CorrelationContextHelper } from '@acme-libs/observability';

import {
  ORDER_LEDGER_RECORD_PORT,
  ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
  type IOrderLedgerRecordPort,
} from '../../outbound';
import { IOrderLedgerRecordPlacedCommand } from '../interfaces';

@Injectable()
export class OrderLedgerService extends SubjectLedgerService {
  constructor(
    @Inject(ORDER_LEDGER_RECORD_PORT)
    protected readonly queue: IOrderLedgerRecordPort,
    @Inject(ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN)
    protected readonly retryAttempts: number,
    @InjectPinoLogger(OrderLedgerService.name)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  public async recordPlaced(command: IOrderLedgerRecordPlacedCommand): Promise<void> {
    const { orderId, customerId, productIds } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(OrderLedgerService.name);

    await this.record({
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
