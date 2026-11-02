import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs/ledger';
import { LEDGER_RECORD_QUEUE, ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import { IAuthLedgerRecordPort, AUTH_LEDGER_RECORD_TIMEOUT_MS } from '../../outbound';

@Injectable()
export class AuthLedgerRecordQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IAuthLedgerRecordPort
{
  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(AUTH_LEDGER_RECORD_TIMEOUT_MS)
    protected readonly timeoutMs: number,
  ) {
    super();
  }
}
