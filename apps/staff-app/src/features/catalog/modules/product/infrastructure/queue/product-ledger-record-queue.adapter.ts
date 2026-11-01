import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs-toolkit';

import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-core-contracts/ledger';

import { IProductLedgerRecordPort, PRODUCT_LEDGER_RECORD_TIMEOUT_MS } from '../../outbound';

@Injectable()
export class ProductLedgerRecordQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IProductLedgerRecordPort
{
  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(PRODUCT_LEDGER_RECORD_TIMEOUT_MS)
    protected readonly timeoutMs: number,
  ) {
    super();
  }
}
