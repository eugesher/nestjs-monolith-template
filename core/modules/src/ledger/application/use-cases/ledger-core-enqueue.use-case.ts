import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import type {
  ILedgerCoreEnqueueCommand,
  ILedgerRecordProcessorPayload,
} from '@acme-core/contracts/ledger';

import {
  LEDGER_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  LEDGER_CORE_QUEUE_PORT,
  LEDGER_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  type ILedgerCoreQueuePort,
} from '../../outbound';

@Injectable()
export class LedgerCoreEnqueueUseCase {
  constructor(
    @Inject(LEDGER_CORE_QUEUE_PORT)
    private readonly queue: ILedgerCoreQueuePort,
    @Inject(LEDGER_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN)
    private readonly enqueueRetryAttempts: number,
    @Inject(LEDGER_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN)
    private readonly timeoutMs: number,
    @InjectPinoLogger(LedgerCoreEnqueueUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ILedgerCoreEnqueueCommand): Promise<void> {
    const { operationKey, subjectType, subjectId } = command;
    const correlationId = CorrelationContextHelper.current(LedgerCoreEnqueueUseCase.name);
    const ledgerRecord = { ...command, correlationId };
    const context = { subjectType, subjectId, operationKey };

    await ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(ledgerRecord), {
      maxAttempts: this.enqueueRetryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue',
      context,
      replayMessage:
        'Ledger enqueue failed permanently: the record may be absent from the queue and the ledger, replay this record',
    });
  }

  private async enqueueOne(record: ILedgerRecordProcessorPayload): Promise<void> {
    const { operationKey, subjectType, subjectId } = record;

    await this.queue.add({ record, timeoutMs: this.timeoutMs });

    this.logger.info({ subjectType, subjectId, operationKey }, 'Ledger record enqueued');
  }
}
