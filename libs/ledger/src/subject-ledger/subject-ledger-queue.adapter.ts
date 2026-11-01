import { ISubjectLedgerQueue } from './subject-ledger-queue.interface';
import { ISubjectLedgerRecord } from './subject-ledger-record.interface';

export abstract class SubjectLedgerQueueAdapter {
  protected abstract readonly queue: ISubjectLedgerQueue;
  protected abstract readonly timeoutMs: number;

  public async enqueue(record: ISubjectLedgerRecord): Promise<void> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt, correlationId } =
      record;
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Enqueue timed out after ${this.timeoutMs} ms`)),
        this.timeoutMs,
      );
    });

    try {
      await Promise.race([
        this.queue.add({
          operationKey,
          subjectType,
          subjectId,
          action,
          payload,
          occurredAt,
          correlationId,
        }),
        timeout,
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
}
