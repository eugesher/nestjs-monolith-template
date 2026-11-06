import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs/ledger';
import { LEDGER_RECORD_QUEUE, ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import {
  IProductCoreLedgerRecordPort,
  PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  PRODUCT_CORE_LEDGER_RECORD_PORT,
} from '../../outbound';

@Injectable()
export class ProductCoreLedgerQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IProductCoreLedgerRecordPort
{
  public static readonly provider: ClassProvider<IProductCoreLedgerRecordPort> = {
    provide: PRODUCT_CORE_LEDGER_RECORD_PORT,
    useClass: ProductCoreLedgerQueueAdapter,
  };

  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN)
    protected readonly timeoutMs: number,
  ) {
    super();
  }
}
