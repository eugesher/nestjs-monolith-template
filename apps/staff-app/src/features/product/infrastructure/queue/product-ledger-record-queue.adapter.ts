import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-staff-contracts/ledger-record';
import {
  IProductLedgerRecordEnqueueCommand,
  IProductLedgerRecordPort,
  PRODUCT_LEDGER_RECORD_TIMEOUT_MS,
} from '../../outbound';

@Injectable()
export class ProductLedgerRecordQueueAdapter implements IProductLedgerRecordPort {
  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    private readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(PRODUCT_LEDGER_RECORD_TIMEOUT_MS)
    private readonly timeoutMs: number,
  ) {}

  public async enqueue(command: IProductLedgerRecordEnqueueCommand): Promise<void> {
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
