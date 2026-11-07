import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LEDGER_RECORD_QUEUE, ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import { LedgerAppendUseCase, LedgerAppendReportFailureUseCase } from '../application';

@Processor(LEDGER_RECORD_QUEUE)
export class LedgerAppendProcessor {
  constructor(
    private readonly append: LedgerAppendUseCase,
    private readonly reportFailure: LedgerAppendReportFailureUseCase,
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
}
