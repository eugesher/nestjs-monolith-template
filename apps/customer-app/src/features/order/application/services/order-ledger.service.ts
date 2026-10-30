import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import {
  type IOrderLedgerRecordEnqueueCommand,
  type IOrderLedgerRecordPort,
  ORDER_LEDGER_RECORD_PORT,
  ORDER_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';
import { IOrderLedgerRecordPlacedCommand } from '../interfaces/commands/order-ledger-record-placed.command';

@Injectable()
export class OrderLedgerService {
  constructor(
    @Inject(ORDER_LEDGER_RECORD_PORT)
    private readonly queue: IOrderLedgerRecordPort,
    @Inject(ORDER_LEDGER_RETRY_ATTEMPTS)
    private readonly ledgerRetryAttempts: number,
    @InjectPinoLogger(OrderLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public recordPlaced(command: IOrderLedgerRecordPlacedCommand): Promise<void> {
    const { orderId, customerId, productIds } = command;
    const operationKey = `order-placed:${orderId}`;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(OrderLedgerService.name);
    const record = {
      operationKey,
      subjectType: 'order',
      subjectId: orderId,
      action: 'OrderPlaced',
      payload: { customerId, productIds },
      occurredAt,
      correlationId,
    };

    return ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(record), {
      maxAttempts: this.ledgerRetryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue (order placed)',
      context: { orderId, operationKey },
      replayMessage:
        'Ledger enqueue failed permanently: the order is placed but absent from the queue and the ledger, replay this record',
    });
  }

  private async enqueueOne(record: IOrderLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId } = record;

    await this.queue.enqueue(record);

    this.logger.info({ orderId: subjectId, operationKey }, 'Ledger record enqueued');
  }
}
