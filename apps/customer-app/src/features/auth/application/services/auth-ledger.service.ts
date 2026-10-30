import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import {
  type IAuthLedgerRecordEnqueueCommand,
  type IAuthLedgerRecordPort,
  AUTH_LEDGER_RECORD_PORT,
} from '../../outbound';
import { IAuthLedgerRecordRegisteredCommand } from '../interfaces/commands/auth-ledger-record-registered.command';

@Injectable()
export class AuthLedgerService {
  private static readonly LEDGER_ENQUEUE_ATTEMPTS = 3;

  constructor(
    @Inject(AUTH_LEDGER_RECORD_PORT)
    private readonly queue: IAuthLedgerRecordPort,
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
      maxAttempts: AuthLedgerService.LEDGER_ENQUEUE_ATTEMPTS,
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
