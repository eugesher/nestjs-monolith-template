import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-core/contracts/ledger';
import { ILedgerRecordQueuePort } from '../../outbound';

@Injectable()
export class LedgerRecordQueueAdapter implements ILedgerRecordQueuePort {
  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    private readonly queue: Queue<ILedgerRecordProcessorPayload>,
  ) {}

  public async retryFailed(): Promise<number> {
    const jobs = await this.queue.getFailed();

    await Promise.all(jobs.map((job) => job.retry()));

    return jobs.length;
  }
}
