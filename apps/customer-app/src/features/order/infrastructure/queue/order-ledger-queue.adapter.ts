import { InjectQueue } from '@nestjs/bull';
import { ClassProvider, Injectable } from '@nestjs/common';
import { type Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs/ledger';
import { ILedgerRecordProcessorPayload, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';

import { IOrderLedgerRecordPort, ORDER_LEDGER_RECORD_PORT } from '../../outbound';

@Injectable()
export class OrderLedgerQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IOrderLedgerRecordPort
{
  public static readonly provider: ClassProvider<IOrderLedgerRecordPort> = {
    provide: ORDER_LEDGER_RECORD_PORT,
    useClass: OrderLedgerQueueAdapter,
  };

  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
  ) {
    super();
  }
}
