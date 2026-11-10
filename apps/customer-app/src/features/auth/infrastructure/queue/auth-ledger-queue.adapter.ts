import { InjectQueue } from '@nestjs/bull';
import { ClassProvider, Injectable } from '@nestjs/common';
import { type Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs/ledger';
import { ILedgerRecordProcessorPayload, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';

import { AUTH_LEDGER_RECORD_PORT, IAuthLedgerRecordPort } from '../../outbound';

@Injectable()
export class AuthLedgerQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IAuthLedgerRecordPort
{
  public static readonly provider: ClassProvider<IAuthLedgerRecordPort> = {
    provide: AUTH_LEDGER_RECORD_PORT,
    useClass: AuthLedgerQueueAdapter,
  };

  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
  ) {
    super();
  }
}
