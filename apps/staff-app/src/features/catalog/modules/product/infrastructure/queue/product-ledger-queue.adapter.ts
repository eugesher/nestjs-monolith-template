import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs/ledger';
import { LEDGER_RECORD_QUEUE, ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import { IProductLedgerRecordPort, PRODUCT_LEDGER_TIMEOUT_MS_TOKEN } from '../../outbound';

@Injectable()
export class ProductLedgerQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IProductLedgerRecordPort
{
  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(PRODUCT_LEDGER_TIMEOUT_MS_TOKEN)
    protected readonly timeoutMs: number,
  ) {
    super();
  }
}
