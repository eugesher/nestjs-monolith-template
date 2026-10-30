import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import {
  type IAuthLedgerRecordEnqueueCommand,
  type IAuthLedgerRecordPort,
  AUTH_LEDGER_RECORD_PORT,
  AUTH_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';
import { IAuthLedgerRecordRegisteredCommand } from '../interfaces/commands/auth-ledger-record-registered.command';

@Injectable()
export class AuthLedgerService {
  constructor(
    @Inject(AUTH_LEDGER_RECORD_PORT)
    private readonly queue: IAuthLedgerRecordPort,
    @Inject(AUTH_LEDGER_RETRY_ATTEMPTS)
    private readonly ledgerRetryAttempts: number,
    @InjectPinoLogger(AuthLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public recordRegistered(command: IAuthLedgerRecordRegisteredCommand): Promise<void> {
    const { customerId, email } = command;
    const operationKey = `customer-registered:${customerId}`;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(AuthLedgerService.name);
    const record = {
      operationKey,
      subjectType: 'customer',
      subjectId: customerId,
      action: 'CustomerRegistered',
      payload: { email },
      occurredAt,
      correlationId,
    };

    return ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(record), {
      maxAttempts: this.ledgerRetryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue (customer registered)',
      context: { customerId, operationKey },
      replayMessage:
        'Ledger enqueue failed permanently: the customer is registered but absent from the queue and the ledger, replay this record',
    });
  }

  private async enqueueOne(record: IAuthLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId } = record;

    await this.queue.enqueue(record);

    this.logger.info({ customerId: subjectId, operationKey }, 'Ledger record enqueued');
  }
}
