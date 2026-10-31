import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Job } from 'bull';

import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-core/contracts/ledger';
import { CorrelationContextHelper } from '@acme-libs/observability';
import {
  LedgerRecordAppendUseCase,
  LedgerRecordReportFailureUseCase,
  LedgerRecordRetryFailedUseCase,
} from '../application';

@Processor(LEDGER_RECORD_QUEUE)
export class LedgerRecordConsumer {
  constructor(
    private readonly append: LedgerRecordAppendUseCase,
    private readonly reportFailure: LedgerRecordReportFailureUseCase,
    private readonly retryFailed: LedgerRecordRetryFailedUseCase,
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

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'ledger-record-retry' })
  public async handleRetryTick(): Promise<void> {
    await CorrelationContextHelper.run(undefined, () => this.retryFailed.execute());
  }
}
