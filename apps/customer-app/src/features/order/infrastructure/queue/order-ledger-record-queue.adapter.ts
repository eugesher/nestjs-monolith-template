import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-core/contracts/ledger';
import {
  IOrderLedgerRecordEnqueueCommand,
  IOrderLedgerRecordPort,
  ORDER_LEDGER_RECORD_TIMEOUT_MS,
} from '../../outbound';

@Injectable()
export class OrderLedgerRecordQueueAdapter implements IOrderLedgerRecordPort {
  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    private readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(ORDER_LEDGER_RECORD_TIMEOUT_MS)
    private readonly timeoutMs: number,
  ) {}

  public async enqueue(command: IOrderLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt, correlationId } =
      command;
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
