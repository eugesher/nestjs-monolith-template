import { ISubjectLedgerEnqueueCommand } from './subject-ledger-enqueue-command.interface';
import { ISubjectLedgerQueue } from './subject-ledger-queue.interface';

export abstract class SubjectLedgerQueueAdapter {
  protected abstract readonly queue: ISubjectLedgerQueue;

  public async enqueue(command: ISubjectLedgerEnqueueCommand): Promise<void> {
    const { record, timeoutMs } = command;
    const { operationKey, subjectType, subjectId, action, payload, occurredAt, correlationId } =
      record;
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Enqueue timed out after ${timeoutMs} ms`)),
        timeoutMs,
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
