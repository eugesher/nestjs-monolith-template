import { InjectQueue } from '@nestjs/bull';
import { ClassProvider, Injectable } from '@nestjs/common';
import { type Queue } from 'bull';

import { ILedgerRecordProcessorPayload, LEDGER_RECORD_QUEUE } from '@acme-libs/contracts/ledger';

import {
  ILedgerLibQueueAddCommand,
  ILedgerLibQueuePort,
  LEDGER_LIB_QUEUE_PORT,
} from '../../outbound';

@Injectable()
export class LedgerLibQueueAdapter implements ILedgerLibQueuePort {
  public static readonly provider: ClassProvider<ILedgerLibQueuePort> = {
    provide: LEDGER_LIB_QUEUE_PORT,
    useClass: LedgerLibQueueAdapter,
  };

  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    private readonly queue: Queue<ILedgerRecordProcessorPayload>,
  ) {}

  public async add(command: ILedgerLibQueueAddCommand): Promise<void> {
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
