import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { ReplayRetryHelper } from '@acme-libs/toolkit';
import { ILedgerLibEnqueueCommand } from '@acme-libs/contracts/ledger';

import {
  LEDGER_LIB_QUEUE_PORT,
  LEDGER_LIB_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  LEDGER_LIB_RETRY_ATTEMPTS_TOKEN,
  type ILedgerLibQueuePort,
} from '../../outbound';

@Injectable()
export class LedgerLibEnqueueUseCase {
  constructor(
    @Inject(LEDGER_LIB_QUEUE_PORT)
    private readonly queue: ILedgerLibQueuePort,
    @Inject(LEDGER_LIB_RETRY_ATTEMPTS_TOKEN)
    private readonly retryAttempts: number,
    @Inject(LEDGER_LIB_REDIS_COMMAND_TIMEOUT_MS_TOKEN)
    private readonly timeoutMs: number,
    @InjectPinoLogger(LedgerLibEnqueueUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ILedgerLibEnqueueCommand): Promise<void> {
    const { operationKey, subjectType, subjectId, correlationId } = command;
    const context = { subjectType, subjectId, operationKey };

    await ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(command), {
      maxAttempts: this.retryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue',
      context,
      replayMessage:
        'Ledger enqueue failed permanently: the record is absent from the queue and the ledger, replay this record',
    });
  }

  private async enqueueOne(record: ILedgerLibEnqueueCommand): Promise<void> {
    const { operationKey, subjectType, subjectId } = record;

    await this.queue.add({ record, timeoutMs: this.timeoutMs });

    this.logger.info({ subjectType, subjectId, operationKey }, 'Ledger record enqueued');
  }
}
