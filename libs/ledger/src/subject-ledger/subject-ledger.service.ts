import { ReplayRetryHelper } from '@acme-libs/toolkit';

import { ISubjectLedgerLogger } from './subject-ledger-logger.interface';
import { ISubjectLedgerPort } from './subject-ledger-port.interface';
import { ISubjectLedgerRecord } from './subject-ledger-record.interface';

export abstract class SubjectLedgerService {
  protected abstract readonly queue: ISubjectLedgerPort;
  protected abstract readonly retryAttempts: number;
  protected abstract readonly timeoutMs: number;
  protected abstract readonly logger: ISubjectLedgerLogger;

  protected async record(record: ISubjectLedgerRecord): Promise<void> {
    const { operationKey, subjectType, subjectId, correlationId } = record;
    const context = { subjectType, subjectId, operationKey };

    await ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(record), {
      maxAttempts: this.retryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue',
      context,
      replayMessage:
        'Ledger enqueue failed permanently: the record is absent from the queue and the ledger, replay this record',
    });
  }

  private async enqueueOne(record: ISubjectLedgerRecord): Promise<void> {
    const { operationKey, subjectType, subjectId } = record;

    await this.queue.enqueue({ record, timeoutMs: this.timeoutMs });

    this.logger.info({ subjectType, subjectId, operationKey }, 'Ledger record enqueued');
  }
}
