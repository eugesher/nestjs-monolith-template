import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs/ledger';
import { LEDGER_RECORD_QUEUE, ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import {
  IProductStockLedgerRecordPort,
  PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  PRODUCT_STOCK_LEDGER_RECORD_PORT,
} from '../../outbound';

@Injectable()
export class ProductStockLedgerQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IProductStockLedgerRecordPort
{
  public static readonly provider: ClassProvider<IProductStockLedgerRecordPort> = {
    provide: PRODUCT_STOCK_LEDGER_RECORD_PORT,
    useClass: ProductStockLedgerQueueAdapter,
  };

  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN)
    protected readonly timeoutMs: number,
  ) {
    super();
  }
}
