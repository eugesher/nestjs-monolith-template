import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Job } from 'bull';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LEDGER_RECORD_QUEUE, ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import {
  LedgerAppendUseCase,
  LedgerAppendReportFailureUseCase,
  LedgerAppendRetryFailedUseCase,
} from '../application';

@Processor(LEDGER_RECORD_QUEUE)
export class LedgerAppendConsumer {
  constructor(
    private readonly append: LedgerAppendUseCase,
    private readonly reportFailure: LedgerAppendReportFailureUseCase,
    private readonly retryFailed: LedgerAppendRetryFailedUseCase,
  ) {}

  @Process()
  public async handleRecord(job: Job<ILedgerRecordProcessorPayload>): Promise<void> {
    const { data } = job;
    const { operationKey, subjectType, subjectId, action, payload, occurredAt, correlationId } =
      data;

    await CorrelationContextHelper.run(correlationId, () =>
      this.append.execute({ operationKey, subjectType, subjectId, action, payload, occurredAt }),
    );
  }

  @OnQueueFailed()
  public async handleFailed(job: Job<ILedgerRecordProcessorPayload>, error: Error): Promise<void> {
    const { data, attemptsMade, opts } = job;
    const { operationKey, correlationId } = data;
    const attempts = opts.attempts ?? 1;

    await CorrelationContextHelper.run(correlationId, () => {
      this.reportFailure.execute({ operationKey, attempt: attemptsMade, attempts, error });

      return Promise.resolve();
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'ledger-append-retry' })
  public async handleRetryTick(): Promise<void> {
    await CorrelationContextHelper.run(undefined, () => this.retryFailed.execute());
  }
}
